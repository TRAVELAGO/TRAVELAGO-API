import { ConfigService } from '@nestjs/config';
import { Hotel } from '@modules/hotel/hotel.entity';
import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Inject,
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
// import { sendMail } from 'src/utils/sendMail';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { TypeSubjectEmail } from '@constants/mail';
import { sendMail } from 'src/utils/sendMail';
// import { TypeSubjectEmail } from '@constants/mail';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Hotel) private hotelRepository: Repository<Hotel>,
    private dataSource: DataSource,
    private jwtService: JwtService,
    private configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
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

  async logout(user: JwtPayloadType): Promise<void> {
    const existUser = await this.userRepository.findOne({
      where: { id: user.id },
    });

    if (!existUser) {
      throw new HttpException('User is not exist.', HttpStatus.UNAUTHORIZED);
    }

    existUser.refreshToken = null;

    await this.userRepository.save(existUser);
    console.log("success")
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
    });
    return { accessToken, refreshToken };
  }

  private async hashPassword(password: string): Promise<string> {
    const saltRound = 10;
    const salt = await bcrypt.genSalt(saltRound);
    const hash = await bcrypt.hash(password, salt);

    return hash;
  }

  async forgetPassword(userEmail: string): Promise<void> {
    // const codeOtp = generateRandomOTP();
    // sendMail(
    //   'dovanbang14082002@gmail.com',
    //   TypeSubjectEmail.FORGETPASS,
    //   codeOtp,
    // );

    const isUser = await this.userRepository.findOne({
      where: { email: userEmail },
    });
    console.log(userEmail);
    // console.log(user.id);
    if (!isUser) {
      throw new HttpException('User is not exist.', HttpStatus.UNAUTHORIZED);
    }
    const codeOtp = generateRandomOTP();
    sendMail(userEmail, TypeSubjectEmail.FORGETPASS, codeOtp);
    this.cacheManager.set(userEmail, codeOtp, 10 * 60 * 1000);
    console.log('succcess');
  }

  async checkCodeOtp(id: any, CodeOtp: string) {
    const idValue = id.id;
    const existedUser = await this.userRepository.findOne({
      where: { id: idValue },
    });
    console.log(idValue);
    if (!existedUser) {
      throw new HttpException('User is not exist.', HttpStatus.UNAUTHORIZED);
    }
    const email = existedUser.email;
    console.log(email);
    let checkcodeOtp: string | null = null;
    try {
      checkcodeOtp = await this.cacheManager.get(email);
      console.log(checkcodeOtp);
      if (checkcodeOtp === null) {
        throw new HttpException('Otp has expired', HttpStatus.UNAUTHORIZED);
      }
    } catch (error) {
      console.error('Error while getting code from cache:', error);
    }
    console.log(CodeOtp);
    if (checkcodeOtp === CodeOtp) {
      const newPass = await this.hashPassword(generateRandomString(10));
      console.log(newPass);
      await this.userRepository.update({ id: idValue }, { password: newPass });
      await this.cacheManager.del(email);
      sendMail(email, TypeSubjectEmail.VERIFIEDCODE, newPass);
    } else {
      throw new HttpException('Otp is not correct.', HttpStatus.UNAUTHORIZED);
    }
  }
}
