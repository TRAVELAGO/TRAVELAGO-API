import {
  Body,
  Controller,
  Param,
  Post,
  UseGuards,
  UsePipes,
  ValidationPipe,
  Headers,
  HttpStatus,
  HttpCode,
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
import { JwtPayloadType } from './strategies/types/jwt-payload.type';
import { ForgotPasswordDto } from './dtos/forgot-password.dto';
import { Otpdto } from './dtos/Otp.dto';

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
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout(
    @GetJwtPayload() user: JwtPayloadType,
    @Headers('Authorization') bearerToken: string,
  ): Promise<void> {
    return this.authService.logout(user, bearerToken);
  }

  @Post('forgot-password')
  async forgotPassWord(
    @Body() forgotPasswordDto: ForgotPasswordDto,
  ): Promise<void> {
    return this.authService.forgotPassword(forgotPasswordDto.email);
  }

  @Post(':id/checkCodeOtp')
  async checkCodeOtp(
    @Param() id: string,
    @Body() codeOtp: Otpdto,
  ): Promise<void> {
    return this.authService.checkCodeOtp(id, codeOtp.code);
  }
}
