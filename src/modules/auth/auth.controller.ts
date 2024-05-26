import {
  Body,
  Controller,
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
import { OtpDto } from './dtos/otp.dto';
import { RoleType } from '@constants/role-type';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register-admin')
  async registerAdmin(
    @Body() registerDto: RegisterDto,
  ): Promise<Partial<User>> {
    return this.authService.register(registerDto, RoleType.ADMIN);
  }

  @Post('register-user')
  async registerUser(@Body() registerDto: RegisterDto): Promise<Partial<User>> {
    return this.authService.register(registerDto, RoleType.USER);
  }

  @Post('register-hotel')
  async registerHotel(
    @Body() registerDto: RegisterDto,
  ): Promise<Partial<User>> {
    return this.authService.register(registerDto, RoleType.HOTEL);
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
    @GetJwtPayload() jwtPayload: JwtPayloadType,
    @Headers('Authorization') bearerToken: string,
  ): Promise<void> {
    return this.authService.logout(jwtPayload, bearerToken);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassWord(
    @Body() forgotPasswordDto: ForgotPasswordDto,
  ): Promise<void> {
    return this.authService.forgotPassword(forgotPasswordDto.email);
  }

  @Post('check-otp')
  @HttpCode(HttpStatus.OK)
  async checkCodeOtp(@Body() otpDto: OtpDto): Promise<void> {
    return this.authService.checkCodeOtp(otpDto);
  }
}
