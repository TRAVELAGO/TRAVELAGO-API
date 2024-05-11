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
import { LoginDto } from '@modules/admin/dtos/login.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { getBlacklistKey } from 'src/utils/cache';
import { UserStatus } from '@constants/user-status';
import { MailService } from '@modules/mail/mail.service';
import { MAX_VERIFY_OTP_TIME } from '@constants/constants';
import { OtpDto } from './dtos/otp.dto';
import { hashPassword } from 'src/utils/hash';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Hotel) private hotelRepository: Repository<Hotel>,
    private dataSource: DataSource,
    private jwtService: JwtService,
    private configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private mailService: MailService,
  ) {}

  async register(
    registerDto: RegisterDto,
    userRole: RoleType = RoleType.USER,
  ): Promise<Partial<User>> {
    if (userRole === RoleType.ADMIN) {
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

      const hashedPassword = await hashPassword(registerDto.password);

      const newUser = await this.userRepository.create({
        ...registerDto,
        password: hashedPassword,
        role: userRole,
        status:
          userRole === RoleType.USER
            ? UserStatus.ACTIVE
            : UserStatus.WAIT_ACTIVE,
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
      fullName: user.fullName,
      role: user.role,
      status: user.status,
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
      fullName: payload.fullName,
      role: payload.role,
      status: payload.status,
    });
  }

  async logout(jwtPayload: JwtPayloadType, bearerToken: string): Promise<void> {
    const jwtToken = bearerToken?.replace('Bearer', '')?.trim();

    const existUser = await this.userRepository.findOne({
      where: { id: jwtPayload.id },
    });

    if (!existUser) {
      throw new HttpException('User is not exist.', HttpStatus.UNAUTHORIZED);
    }

    existUser.refreshToken = null;

    await this.userRepository.save(existUser);

    const ttl = Math.floor(Date.now()) - jwtPayload.exp * 1000;

    await this.cacheManager.set(getBlacklistKey(jwtToken), jwtToken, ttl);
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

  async forgotPassword(userEmail: string): Promise<void> {
    const existedUser = await this.userRepository.findOne({
      where: { email: userEmail },
    });

    if (existedUser) {
      const otpCode = generateRandomOTP();

      await this.cacheManager.set(
        userEmail,
        otpCode,
        MAX_VERIFY_OTP_TIME * 60 * 1000,
      );

      await this.mailService.sendOtpCodeMail(existedUser.email, otpCode);
    }
  }

  async checkCodeOtp(otpDto: OtpDto) {
    const existedUser = await this.userRepository.findOne({
      where: { email: otpDto.email },
    });

    if (!existedUser) {
      throw new BadRequestException('Email is not exists.');
    }
    const email = existedUser.email;

    const checkOtpCode = await this.cacheManager.get(email);

    if (!checkOtpCode) {
      throw new BadRequestException('Otp has expired.');
    }

    if (checkOtpCode !== otpDto.code) {
      throw new BadRequestException('Otp is not correct.');
    }

    const newPassword = generateRandomString(10);
    const newHashedPassword = await hashPassword(newPassword);

    await this.userRepository.update(
      { id: existedUser.id },
      { password: newHashedPassword },
    );

    await this.cacheManager.del(email);

    await this.mailService.sendNewPasswordMail(existedUser.email, newPassword);
  }
}
