import { BookingStatus } from '@constants/booking-status';
import { REDIS_HASH_BOOKING_KEY } from '@constants/constants';
import { Booking } from '@modules/booking/booking.entity';
import { Injectable, Logger } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { RedisService } from '@shared/services/redis.service';
import { In, Repository } from 'typeorm';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(
    private redisService: RedisService,
    @InjectRepository(Booking) private bookingRepository: Repository<Booking>,
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
      });

      for (let i = 0; i < expiredBookings.length; i++) {
        expiredBookings[i].status = BookingStatus.CANCEL;
      }

      await this.bookingRepository.save(expiredBookings);

      // delete cache
      this.redisService.hDel(REDIS_HASH_BOOKING_KEY, ...expiredBookingIds);
    }

    this.logger.debug(
      `The number of overdue bookings is ${expiredBookingIds.length}`,
    );
  }
}
