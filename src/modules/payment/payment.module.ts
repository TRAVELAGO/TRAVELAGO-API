import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from './payment.entity';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { BookingModule } from '@modules/booking/booking.module';
import { VNPayService } from '@shared/services/vnpay.services';
import { RedisService } from '@shared/services/redis.service';

@Module({
  imports: [TypeOrmModule.forFeature([Payment]), BookingModule],
  controllers: [PaymentController],
  providers: [PaymentService, VNPayService, RedisService],
  exports: [TypeOrmModule, PaymentService],
})
export class PaymentModule {}
