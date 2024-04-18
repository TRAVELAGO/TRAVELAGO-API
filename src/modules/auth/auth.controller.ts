import {
  Body,
  Controller,
  Post,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { LoginUserDto } from './dtos/login.dto';
import { User } from '@modules/user/user.entity';
import { RegisterDto } from './dtos/register.dto';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { LoginResponse } from './strategies/types/login.type';
import { GetJwtPayload } from '@decorators/get-jwt-payload.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Request } from 'express';
import { JwtPayloadType } from './strategies/types/jwt-payload.type';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto): Promise<Partial<User>> {
    return this.authService.register(registerDto);
  }

  @Post('registerHotel')
  async registerHotel(
    @Body() registerHotelDto: RegisterDto,
  ): Promise<Partial<User>> {
    return this.authService.registerHotel(registerHotelDto);
  }

  @Post('login')
  @UsePipes(ValidationPipe)
  async login(@Body() loginDto: LoginUserDto): Promise<LoginResponse> {
    return this.authService.login(loginDto);
  }

  @Post('refresh-token')
  @ApiBearerAuth()
  @UseGuards(JwtRefreshGuard)
  async refreshToken(@GetJwtPayload() user): Promise<any> {
    return this.authService.refreshToken(user);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@GetJwtPayload() user: JwtPayloadType): Promise<void> {
    return this.authService.logout(user);
  }

  @Post('fogetPassword')
  async forgetPassWord(@Body() email: string): Promise<void> {
    return this.authService.forgetPassword(email);
  }

  @UseGuards(JwtAuthGuard)
  @Post('checkCodeOtp')
  async checkCodeOtp(
    @Req() req: Request,
    @Body() codeOtp: string,
  ): Promise<void> {
    const userId = (req.user as any).id;
    return this.authService.checkCodeOtp(userId, codeOtp);
  }
}
