import { Module } from '@nestjs/common';
import { BookingService } from './booking.service';
import { BookingController } from './booking.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking } from './booking.entity';
import { RoomModule } from '@modules/room/room.module';
import { JwtStrategy } from '@modules/auth/strategies/jwt.strategy';
import { VNPayService } from '@shared/services/vnpay.services';
import { VoucherModule } from '@modules/voucher/voucher.module';

@Module({
  imports: [TypeOrmModule.forFeature([Booking]), RoomModule, VoucherModule],
  controllers: [BookingController],
  providers: [BookingService, VNPayService, JwtStrategy],
  exports: [TypeOrmModule],
})
export class BookingModule {}
