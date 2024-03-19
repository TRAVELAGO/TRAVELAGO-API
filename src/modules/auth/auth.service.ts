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
import { RoleType } from '@constants/role-type';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Hotel) private hotelRepository: Repository<Hotel>,
    private dataSource: DataSource,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<Partial<User>> {
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

      return {
        id: newUser.id,
        email: newUser.email,
        fullName: newUser.fullName,
        role: newUser.role,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
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
      const checkExistToken = await this.userRepository.findOneBy({
        email: verify.email,
        refreshToken,
      });
      if (checkExistToken) {
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

  async generateToken(payload: { id: string; email: string }) {
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
