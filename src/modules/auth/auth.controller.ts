import {
  Body,
  Controller,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags } from '@nestjs/swagger';
import { LoginDto } from './dtos/login.dto';
import { User } from '@modules/user/user.entity';
import { RegisterDto } from './dtos/register.dto';
@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto): Promise<Partial<User>> {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @UsePipes(ValidationPipe)
  async login(@Body() loginDto: LoginDto): Promise<User> {
    console.log('login API');
    console.log(loginDto);
    return this.authService.login(loginDto);
  }

  @Post('refresh-token')
  async refreshToken(@Body() { refreshToken }): Promise<any> {
    console.log('refresh token api');
    return this.authService.refreshToken(refreshToken);
  }
}
