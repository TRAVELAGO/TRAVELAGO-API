import { User } from '@modules/user/user.entity';
import { Hotel } from '@modules/hotel/hotel.entity';
import { Booking } from '@modules/booking/booking.entity';
import { Payment } from '@modules/payment/payment.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Hotel, Booking, Payment])],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
