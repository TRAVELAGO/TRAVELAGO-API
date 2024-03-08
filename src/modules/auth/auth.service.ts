import { Hotel } from '@modules/hotel/hotel.entity';
import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dtos/login.dto';
import { User } from '@modules/user/user.entity';
import { RegisterDto } from './dtos/register.dto';
import { JwtService } from '@nestjs/jwt';
import { RoleType } from '@constants/role-type';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(User) private hotelRepository: Repository<Hotel>,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<Partial<User>> {
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
      // if (existedUser.isVerified) {
      throw new BadRequestException('Email has been verified.');
      // } else {
      // throw new UnauthorizedException(
      //   {
      //     email: existedUser.email,
      //   },
      //   'Email has been registered but not authenticated.',
      // );
      // }
    }

    const hashPassword = await this.hashPassword(registerDto.password);

    const newUser = await this.userRepository.save({
      ...registerDto,
      password: hashPassword,
    });

    if (newUser.role === RoleType.HOTEL) {
      const newHotel = this.hotelRepository.create({
        user: newUser,
        name: registerDto?.hotelName,
      });
      await this.hotelRepository.save(newHotel);
    }

    return {
      id: newUser.id,
      email: newUser.email,
      fullName: newUser.fullName,
    };
  }

  async login(loginDto: LoginDto): Promise<any> {
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

    const payload = { id: user.id, email: user.email };
    return this.generateToken(payload);
  }

  async refreshToken(refreshToken: string): Promise<any> {
    try {
      const verify = await this.jwtService.verifyAsync(refreshToken, {
        secret: '1234567',
      });
      console.log(verify);
      const checkExsitToken = await this.userRepository.findOneBy({
        email: verify.email,
        refreshToken,
      });
      if (checkExsitToken) {
        return this.generateToken({ id: verify.id, email: verify.email });
      } else {
        throw new HttpException(
          'Refresh token is not valid.',
          HttpStatus.BAD_REQUEST,
        );
      }
    } catch (error) {
      throw new HttpException(
        'Refresh token is not valid.',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async generateToken(payload: { id: number; email: string }) {
    const accessToken = await this.jwtService.signAsync(payload);
    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: '1234567',
      expiresIn: '1d',
    });

    await this.userRepository.update(
      { email: payload.email },
      { refreshToken: refreshToken },
    );
    return { accessToken, refreshToken };
  }

  private async hashPassword(password: string): Promise<string> {
    const saltRound = 10;
    const salt = await bcrypt.genSalt(saltRound);
    const hash = await bcrypt.hash(password, salt);

    return hash;
  }
}
