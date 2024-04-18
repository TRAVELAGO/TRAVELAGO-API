import { ConfigService } from '@nestjs/config';
import { Hotel } from '@modules/hotel/hotel.entity';
import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '@modules/user/user.entity';
import { RegisterDto } from './dtos/register.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayloadType } from './strategies/types/jwt-payload.type';
import { LoginResponse, Token } from './strategies/types/login.type';
import { RoleType } from '@constants/role-type';
import { generateRandomOTP, generateRandomString } from '../../utils/random';
import { RegisterHotelDto } from './dtos/registerHotel.dto';
import { LoginDto } from '@modules/admin/dtos/login.dto';
// import { sendMail } from 'src/utils/sendmail';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Hotel) private hotelRepository: Repository<Hotel>,
    private dataSource: DataSource,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto): Promise<Partial<User>> {
    if (registerDto.role === RoleType.ADMIN) {
      throw new BadRequestException('Unable to register for admin role.');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const phoneExists = await this.userRepository.exists({
        where: {
          phoneNumber: registerDto.phoneNumber,
        },
      });

      if (phoneExists) {
        throw new BadRequestException('Phone number already exists.');
      }

      const existedUser = await this.userRepository.findOne({
        where: { email: registerDto.email },
      });

      if (existedUser) {
        throw new BadRequestException('Email has been verified.');
      }

      const hashPassword = await this.hashPassword(registerDto.password);

      const newUser = await this.userRepository.create({
        ...registerDto,
        password: hashPassword,
        role: RoleType.USER,
      });

      await queryRunner.manager.save(newUser);
      await queryRunner.commitTransaction();

      return newUser;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async registerHotel(
    registerHotelDto: RegisterHotelDto,
  ): Promise<Partial<User>> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const phoneExists = await this.userRepository.exists({
        where: {
          phoneNumber: registerHotelDto.phoneNumber,
        },
      });

      if (phoneExists) {
        throw new BadRequestException('Phone number already exists.');
      }

      const existedUser = await this.userRepository.findOne({
        where: { email: registerHotelDto.email },
      });

      if (existedUser) {
        throw new BadRequestException('Email has been verified.');
      }

      const hashPassword = await this.hashPassword(registerHotelDto.password);

      const newUser = await this.userRepository.create({
        ...registerHotelDto,
        password: hashPassword,
        role: RoleType.HOTEL,
        status: 0,
      });

      await queryRunner.manager.save(newUser);

      const newHotel = this.hotelRepository.create({
        user: newUser,
        name: registerHotelDto?.hotelName,
        images: [],
      });
      await queryRunner.manager.save(newHotel);

      await queryRunner.commitTransaction();

      return newUser;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async login(loginDto: LoginDto): Promise<LoginResponse> {
    const user = await this.userRepository.findOne({
      where: { email: loginDto.email },
    });

    if (!user) {
      throw new HttpException('Email is not exist', HttpStatus.UNAUTHORIZED);
    }

    const checkPass = bcrypt.compareSync(loginDto.password, user.password);
    if (!checkPass) {
      throw new HttpException(
        'Password is not correct.',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const jwtPayload: JwtPayloadType = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    const response: LoginResponse = {
      ...(await this.generateToken(jwtPayload)),
      user,
    };

    if (user.role === RoleType.HOTEL) {
      response.hotel = await this.hotelRepository.find({
        where: {
          user: { id: user.id },
        },
      });
    }

    return response;
  }

  async refreshToken(payload: JwtPayloadType): Promise<Token> {
    return this.generateToken({
      id: payload.id,
      email: payload.email,
      role: payload.role,
    });
  }

  async logout(id: string, accessToken: string): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id: id },
    });

    if (!user) {
      throw new HttpException('User is not exist.', HttpStatus.UNAUTHORIZED);
    }

    console.log('ACVV' + user.refreshToken);

    if (accessToken !== user.accessToken) {
      throw new HttpException(
        'ACCESS_TOKEN_NOT_EXIST_IN_DATA.',
        HttpStatus.UNAUTHORIZED,
      );
    } else {
      await this.userRepository.update(id, {
        accessToken: '',
        refreshToken: '',
      });
    }
  }

  async checkRefreshToken(
    userId: string,
    refreshToken: string,
  ): Promise<boolean> {
    return this.userRepository.exists({
      where: {
        id: userId,
        refreshToken,
      },
    });
  }

  async generateToken(payload: JwtPayloadType): Promise<Token> {
    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: '3h',
    });
    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_SECRET_RT_KEY'),
      expiresIn: '1d',
    });

    await this.userRepository.update(payload.id, {
      refreshToken: refreshToken,
      accessToken: accessToken,
    });
    return { accessToken, refreshToken };
  }

  private async hashPassword(password: string): Promise<string> {
    const saltRound = 10;
    const salt = await bcrypt.genSalt(saltRound);
    const hash = await bcrypt.hash(password, salt);

    return hash;
  }

  async forgetPassword(email: string): Promise<void> {
    const user = this.userRepository.findOne({
      where: { email: email },
    });

    if (!user) {
      throw new HttpException('Email is noy correct', HttpStatus.BAD_REQUEST);
    } else {
      // const id = (await user).id;
      // const email = (await user).email;
      // const role = (await user).role;
      // const jwtPayload: JwtPayloadType = {
      //   id: id,
      //   email: email,
      //   role: role,
      // };
      // const accessToken = (await this.generateToken(jwtPayload)).accessToken;
      // const refreshToken = (await this.generateToken(jwtPayload)).refreshToken;

      // this.userRepository.update({email}, {accessToken: accessToken, refreshToken});

      const codeOtp = generateRandomOTP();
      await this.userRepository.update({ email }, { codeOtp: codeOtp });

      //send mail with code

      // sendMail(email, 'CodeOtp', codeOtp);
    }
  }

  async checkCodeOtp(id: string, CodeOtp: string) {
    let checkcodeOtp: string | null = null;
    // check database
    try {
      checkcodeOtp = (await this.userRepository.findOne({ where: { id: id } }))
        .codeOtp;
    } catch (error) {}

    if (checkcodeOtp === CodeOtp) {
      // let currentTime = (new Date().getTime() + (7 * 60 * 60 * 1000));
      // // console.log(currentTime)
      // // console.log(verifyCode.timeExpired.getTime())
      // if (currentTime > verifyCode.timeExpired.getTime()) {

      // }
      const newPass = await this.hashPassword(generateRandomString(10));
      await this.userRepository.update({ id: id }, { password: newPass });
    }
  }
}
