import { BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Payment } from './payment.entity';
import { CreatePaymentDto } from './dtos/create-payment.dto';
import { UpdatePaymentDto } from './dtos/update-payment.dto';
import { VerifyPaymentDto } from './dtos/verify-payment.dto';
import { Booking } from '@modules/booking/booking.entity';
import { VNPTransactionStatus, VNPayResponse } from '@constants/vnp-response';
import { VNPayService } from '@shared/services/vnpay.services';
import { PaymentMethod } from '@constants/payment-method';
import { PaymentStatus } from '@constants/payment-status';
import { getDateFromVNPDate } from 'src/utils/date';
import { BookingStatus } from '@constants/booking-status';
import { RedisService } from '@shared/services/redis.service';
import { REDIS_HASH_BOOKING_KEY } from '@constants/constants';

export class PaymentService {
  constructor(
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
    private vnPayService: VNPayService,
    private dataSource: DataSource,
    private redisService: RedisService,
  ) {}

  async find(paymentId: string): Promise<Payment> {
    const existedPayment = await this.paymentRepository.findOne({
      where: {
        id: paymentId,
      },
    });

    if (!existedPayment) {
      throw new NotFoundException('Payment does not exist.');
    }

    return existedPayment;
  }

  async findAll(): Promise<Payment[]> {
    return await this.paymentRepository.find();
  }

  async verifyPayment(verifyPaymentDto: VerifyPaymentDto): Promise<any> {
    if (
      !this.vnPayService.verifyPaySecureHash(verifyPaymentDto) ||
      verifyPaymentDto.vnp_ResponseCode !== VNPayResponse.SUCCESS ||
      verifyPaymentDto.vnp_TransactionStatus !== VNPTransactionStatus.SUCCESS
    ) {
      throw new BadRequestException('Payment failed.');
    }

    const existedBooking = await this.bookingRepository.findOne({
      where: {
        id: verifyPaymentDto.vnp_TxnRef,
      },
      relations: {
        user: true,
      },
    });

    if (!existedBooking) {
      throw new NotFoundException('Booking not exists.');
    }

    // check payment from vnpay
    // const queryDRBody = this.vnPayService.createQueryDR(
    //   existedBooking,
    //   verifyPaymentDto,
    // );

    // const response = await sendPostRequest(
    //   this.configService.get<string>('VNP_TRANSACTION_URL'),
    //   queryDRBody,
    // );

    const newPayment: Payment = this.paymentRepository.create({
      amount: Number(verifyPaymentDto.vnp_Amount) / 100,
      transactionCode: String(verifyPaymentDto.vnp_TransactionNo),
      paymentMethod: PaymentMethod.VN_PAY,
      status: PaymentStatus.PAID,
      paymentDate: getDateFromVNPDate(verifyPaymentDto.vnp_PayDate),
      booking: existedBooking,
      user: {
        id: existedBooking.user.id,
      },
    });

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      existedBooking.status = BookingStatus.PAID;

      await queryRunner.manager.save(existedBooking);
      await queryRunner.manager.save(newPayment);

      await this.redisService.hDel(REDIS_HASH_BOOKING_KEY, existedBooking.id);

      await queryRunner.commitTransaction();

      return newPayment;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async create(createPaymentDto: CreatePaymentDto): Promise<Payment> {
    return await this.paymentRepository.save(createPaymentDto);
  }

  async update(
    paymentId: string,
    updatePaymentDto: UpdatePaymentDto,
  ): Promise<Payment> {
    const existedPayment = await this.paymentRepository.findOne({
      where: {
        id: paymentId,
      },
    });

    if (!existedPayment) {
      throw new NotFoundException('Payment does not exist.');
    }

    this.paymentRepository.merge(existedPayment, updatePaymentDto);

    return this.paymentRepository.save(existedPayment);
  }

  // async delete(paymentId: string): Promise<void> {
  //   const deletedPayment = await this.paymentRepository.delete(paymentId);
  //   if (!deletedPayment.affected) {
  //     throw new NotFoundException('Payment not found.');
  //   }
  // }
}
