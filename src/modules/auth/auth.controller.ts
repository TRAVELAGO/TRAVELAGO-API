import {
  Body,
  Controller,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags } from '@nestjs/swagger';
import { LoginDto } from './dtos/login-dto';
import { User } from '@modules/user/user.entity';
import { RegisterDto } from './dtos/register-dto';
import { forgotPasswordDto } from './dtos/forgotPassword.dto';
@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  register(@Body() registerDto: RegisterDto): Promise<User> {
    console.log('register API');
    console.log(registerDto);
    return this.authService.register(registerDto);
  }

  @Post('login')
  @UsePipes(ValidationPipe)
  login(@Body() loginDto: LoginDto): Promise<User> {
    console.log('login API');
    console.log(loginDto);
    return this.authService.login(loginDto);
  }

  @Post('refresh-token')
  refreshToken(@Body() { refreshToken }): Promise<any> {
    console.log('refresh token api');
    return this.authService.refreshToken(refreshToken);
  }


  @Post('send-email-code')
  sendEmailCode(@Body('email') email:string): Promise<any> {
    console.log('send email code api');
    return this.authService.sendEmailForgotPassword(email);
  }

  @Post('forgotPassword')
  forgotPassword(@Body() forgotPassword: forgotPasswordDto): Promise<any> {
    console.log('forgot password API');
    return this.authService.forgotPassword(forgotPassword);

  }
}
