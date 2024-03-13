import { User } from '@modules/user/user.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { Hotel } from '@modules/hotel/hotel.entity';
@Module({
  imports: [
    TypeOrmModule.forFeature([User, Hotel]),
    JwtModule.register({
      global: true,
      secret: '123456',
      signOptions: { expiresIn: '15m' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
