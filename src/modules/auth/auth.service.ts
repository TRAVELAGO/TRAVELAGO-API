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
import { LoginDto } from './dtos/login.dto';
import { User } from '@modules/user/user.entity';
import { RegisterDto } from './dtos/register.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayloadType } from './strategies/types/jwt-payload.type';
import { LoginResponse, Token } from './strategies/types/login.type';
import { RoleType } from '@constants/role-type';

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
      });

      await queryRunner.manager.save(newUser);

      if (newUser.role === RoleType.HOTEL) {
        const newHotel = this.hotelRepository.create({
          user: newUser,
          name: registerDto?.hotelName,
          images: [],
        });
        await queryRunner.manager.save(newHotel);
      }

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

    return { ...(await this.generateToken(jwtPayload)), user };
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
      expiresIn: '1h',
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
}
