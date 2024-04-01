import {
  Body,
  Controller,
  Post,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { LoginDto } from './dtos/login.dto';
import { User } from '@modules/user/user.entity';
import { RegisterDto } from './dtos/register.dto';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { LoginResponse } from './strategies/types/login.type';
import { GetJwtPayload } from '@decorators/get-jwt-payload.decorator';

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
  async login(@Body() loginDto: LoginDto): Promise<LoginResponse> {
    return this.authService.login(loginDto);
  }

  @Post('refresh-token')
  @ApiBearerAuth()
  @UseGuards(JwtRefreshGuard)
  async refreshToken(@GetJwtPayload() user): Promise<any> {
    return this.authService.refreshToken(user);
  }
}
