import { BookingStatus } from '@constants/booking-status';
import { REDIS_HASH_BOOKING_KEY } from '@constants/constants';
import { Booking } from '@modules/booking/booking.entity';
import { Voucher } from '@modules/voucher/voucher.entity';
import { Injectable, Logger } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { RedisService } from '@modules/redis/redis.service';
import { DataSource, In, Repository } from 'typeorm';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(
    private redisService: RedisService,
    @InjectRepository(Booking) private bookingRepository: Repository<Booking>,
    private dataSource: DataSource,
  ) {}

  @Interval(2 * 60 * 1000)
  async handleExpiredPayment() {
    const bookingNotPaid = await this.redisService.hGetAll(
      REDIS_HASH_BOOKING_KEY,
    );
    const now = new Date().getTime();
    const expiredBookingIds: string[] = [];

    for (const field in bookingNotPaid) {
      if (
        bookingNotPaid.hasOwnProperty(field) &&
        now > Number(bookingNotPaid[field])
      ) {
        expiredBookingIds.push(field);
      }
    }

    if (expiredBookingIds.length > 0) {
      const expiredBookings = await this.bookingRepository.find({
        where: {
          id: In(expiredBookingIds),
          status: BookingStatus.NEW,
        },
        relations: {
          voucher: true,
        },
      });

      const vouchers: Voucher[] = [];

      expiredBookings.forEach((expiredBooking) => {
        expiredBooking.status = BookingStatus.CANCEL;

        if (expiredBooking.voucher) {
          let isAddVoucher = true;

          for (const voucher of vouchers) {
            if (voucher.id === expiredBooking.voucher.id) {
              ++voucher.quantity;
              isAddVoucher = false;
              break;
            }
          }

          if (isAddVoucher) {
            ++expiredBooking.voucher.quantity;
            vouchers.push(expiredBooking.voucher);
          }
        }
      });

      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        await queryRunner.manager.save(expiredBookings);
        await queryRunner.manager.save(vouchers);

        await queryRunner.commitTransaction();

        // delete cache
        this.redisService.hDel(REDIS_HASH_BOOKING_KEY, ...expiredBookingIds);
      } catch (error) {
        this.logger.debug(error);
        await queryRunner.rollbackTransaction();
      } finally {
        await queryRunner.release();
      }
    }

    this.logger.debug(
      `The number of overdue bookings is ${expiredBookingIds.length}`,
    );
  }
}
