import { User } from '@modules/user/user.entity';
import { Hotel } from '@modules/hotel/hotel.entity';
import { Booking } from '@modules/booking/booking.entity';
import { Payment } from '@modules/payment/payment.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { JwtRefreshStrategy } from './strategies/refresh.strategy';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (
        configService: ConfigService,
      ): Promise<JwtModuleOptions> => ({
        global: true,
        secret: configService.get<string>('JWT_SECRET_KEY'),
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([User, Hotel, Booking, Payment])],
  controllers: [AdminController],
  providers: [AdminService, JwtRefreshStrategy],
})
export class AdminModule {}
