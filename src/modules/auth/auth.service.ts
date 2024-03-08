import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dtos/login-dto';
import { User } from '@modules/user/user.entity';
import { RegisterDto } from './dtos/register-dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<User> {
    const hashPassword = await this.hashPassword(registerDto.password);
    return await this.userRepository.save({
      ...registerDto,
      refreshTocken: 'refreshToken',
      password: hashPassword,
    });
  }

  async login(loginDto: LoginDto): Promise<any> {
    const user = await this.userRepository.findOne({
      where: { email: loginDto.email },
    });

    if (!user) {
      throw new HttpException('Email is not exsit', HttpStatus.UNAUTHORIZED);
    }

    const checkPass = bcrypt.compareSync(loginDto.password, user.password);
    if (!checkPass) {
      throw new HttpException(
        'Password is not correct',
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
          'refresh token is not valid',
          HttpStatus.BAD_REQUEST,
        );
      }
    } catch (error) {
      throw new HttpException(
        'refresh token is not valid',
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
