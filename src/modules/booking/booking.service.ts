import { ConfigService } from '@nestjs/config';
import { UpdateBookingDto } from './dtos/update-booking.dto';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Brackets,
  DataSource,
  FindManyOptions,
  FindOptionsWhere,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { Booking } from './booking.entity';
import { CreateBookingDto } from './dtos/create-booking.dto';
import { BookingStatus } from '@constants/booking-status';
import { addTime } from 'src/utils/date';
import { JwtPayloadType } from '@modules/auth/strategies/types/jwt-payload.type';
import { isHotel, isUser } from 'src/utils/roles';
import { SearchBookingDto } from './dtos/search-booking.dto';
import { PageDto } from 'src/common/dtos/page.dto';
import { getOrderOption, getPaginationOption } from 'src/utils/pagination';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { PageMetaDto } from 'src/common/dtos/page-meta.dto';
import { BookingType } from '@constants/booking-type';
import { Room } from '@modules/room/room.entity';
import { addMinutes, differenceInCalendarDays } from 'date-fns';
import { VNPayService } from '@shared/services/vnpay.services';
import { REDIS_HASH_BOOKING_KEY, MAX_PAYMENT_TIME } from '@constants/constants';
import { Cache } from 'cache-manager';
import { RedisService } from '@modules/redis/redis.service';
import { Voucher } from '@modules/voucher/voucher.entity';
import { VoucherType } from '@constants/voucher-type';
import { MailService } from '@modules/mail/mail.service';

@Injectable()
export class BookingService {
  constructor(
    @InjectRepository(Booking) private bookingRepository: Repository<Booking>,
    @InjectRepository(Room) private roomRepository: Repository<Room>,
    @InjectRepository(Voucher) private voucherRepository: Repository<Voucher>,
    private dataSource: DataSource,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private redisService: RedisService,
    private configService: ConfigService,
    private vnPayService: VNPayService,
    private mailService: MailService,
  ) {}

  async find(user: JwtPayloadType, bookingId: string): Promise<Booking> {
    const existedBooking = await this.bookingRepository.findOne({
      where: {
        id: bookingId,
        user: isUser(user) ? { id: user.id } : undefined,
        hotel: isHotel(user)
          ? {
              user: { id: user.id },
            }
          : undefined,
      },
      relations: {
        user: true,
        room: true,
      },
    });

    if (!existedBooking) {
      throw new NotFoundException('Booking not found.');
    }

    return existedBooking;
  }

  async search(
    user: JwtPayloadType,
    searchBookingDto: SearchBookingDto,
  ): Promise<PageDto<Booking>> {
    const findManyOption: FindManyOptions<Booking> = this.getFindManyOption(
      user,
      searchBookingDto,
    );

    const [bookings, itemCount] = await this.bookingRepository.findAndCount({
      ...findManyOption,
      ...getPaginationOption<Booking>(
        searchBookingDto.pageNumber,
        searchBookingDto.pageSize,
      ),
      ...(await getOrderOption<Booking>(
        Booking,
        searchBookingDto.order,
        this.cacheManager,
      )),
      relations: {
        user: true,
        room: true,
      },
    });

    // create metadata
    const pageMetaDto = new PageMetaDto({
      itemCount,
      pageOptionsDto: searchBookingDto,
    });

    // add data to PageDto
    return new PageDto(bookings, pageMetaDto);
  }

  private async createBooking(
    user: JwtPayloadType,
    createBookingDto: CreateBookingDto,
    bookingType: BookingType,
  ): Promise<Booking> {
    if (!Object.values(BookingType).includes(bookingType)) {
      throw new BadRequestException('booking type is invalid!');
    }
    const isUserRole: boolean = isUser(user);
    const isHotelRole: boolean = isHotel(user);

    // Only allows users to book online and hotel book directly
    if (
      (isUserRole && bookingType !== BookingType.ONLINE) ||
      (isHotelRole && bookingType !== BookingType.DIRECTLY)
    ) {
      throw new ForbiddenException();
    }

    const existedRoom = await this.roomRepository.findOne({
      where: {
        id: createBookingDto.roomId,
      },
      relations: {
        hotel: {
          user: true,
        },
      },
    });

    if (!existedRoom) {
      throw new BadRequestException('Room does not exist.');
    }

    // Check the room belongs to the hotel
    if (isHotelRole && existedRoom.hotel.user.id !== user.id) {
      throw new ForbiddenException();
    }

    // dateTo needs to be greater than dateFrom
    if (createBookingDto.dateFrom >= createBookingDto.dateTo) {
      throw new BadRequestException('dateTo must be greater than dateFrom.');
    }

    // add time check in
    const dateFrom = addTime(
      createBookingDto.dateFrom,
      existedRoom.hotel.checkInTime,
    );

    // add time check out
    const dateTo = addTime(
      createBookingDto.dateTo,
      existedRoom.hotel.checkOutTime,
    );

    // dateFrom needs to be greater than now
    if (dateFrom < new Date()) {
      throw new BadRequestException('dateFrom and dateTo are not valid.');
    }

    // check conflict booking time
    if (
      await this.checkConflictBookingTime(
        existedRoom.id,
        existedRoom.total,
        dateFrom,
        dateTo,
      )
    ) {
      throw new ConflictException('The room has been booked at this time');
    }

    const newBooking = this.bookingRepository.create({
      ...createBookingDto,
      room: existedRoom,
      hotel: {
        id: existedRoom.hotel.id,
      },
      user: isUserRole
        ? {
            id: user.id,
          }
        : undefined,
      totalAmount:
        differenceInCalendarDays(
          createBookingDto.dateTo,
          createBookingDto.dateFrom,
        ) *
        (existedRoom.price - existedRoom.discount),
      totalDiscount: 0,
      status: isHotelRole ? BookingStatus.CHECK_IN : BookingStatus.NEW,
      type: isHotelRole ? BookingType.DIRECTLY : BookingType.ONLINE,
      dateFrom,
      dateTo,
    });

    return newBooking;
  }

  async createBookingOnline(
    user: JwtPayloadType,
    createBookingDto: CreateBookingDto,
    ipAddress?: string,
  ): Promise<Booking> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const newBooking = await this.createBooking(
        user,
        createBookingDto,
        BookingType.ONLINE,
      );

      if (createBookingDto.voucherId) {
        const existedVoucher = await this.voucherRepository.findOne({
          where: {
            id: createBookingDto.voucherId,
          },
          relations: ['hotel'],
        });

        if (!existedVoucher) {
          throw new BadRequestException('Voucher does not exist.');
        }

        if (
          existedVoucher.quantity <= 0 ||
          existedVoucher.expiredDate < new Date() ||
          (existedVoucher.type === VoucherType.ONLY_HOTEL &&
            existedVoucher.hotel.id !== newBooking.room.hotel.id) ||
          (existedVoucher.minimumAmount &&
            existedVoucher.minimumAmount > newBooking.totalAmount)
        ) {
          throw new BadRequestException('Voucher cannot be applied.');
        }

        newBooking.totalDiscount = Math.floor(
          existedVoucher.discountPercentage
            ? Math.min(
                (existedVoucher.discountPercentage / 100) *
                  newBooking.totalAmount,
                existedVoucher.maximumDiscount,
              )
            : existedVoucher.maximumDiscount,
        );

        newBooking.voucher = existedVoucher;
        --existedVoucher.quantity;

        await queryRunner.manager.save(existedVoucher);
      }

      await queryRunner.manager.save(newBooking);

      newBooking.paymentUrl = this.vnPayService.getVNPayUrl(
        this.configService.get<string>('VNP_PAY_URL'),
        this.vnPayService.getPayQueryData(newBooking, ipAddress),
      );

      await queryRunner.manager.save(newBooking);

      await this.redisService.hSet(
        REDIS_HASH_BOOKING_KEY,
        newBooking.id,
        String(
          addMinutes(newBooking.createdAt, MAX_PAYMENT_TIME + 5).getTime(),
        ),
      );

      await queryRunner.commitTransaction();

      this.mailService.sendBookingSuccessMail(user, newBooking);

      return newBooking;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async createBookingDirectly(
    user: JwtPayloadType,
    createBookingDto: CreateBookingDto,
  ): Promise<Booking> {
    const newBooking = await this.createBooking(
      user,
      createBookingDto,
      BookingType.DIRECTLY,
    );

    return this.bookingRepository.save(newBooking);
  }

  async updateStatus(
    user: JwtPayloadType,
    bookingId: string,
    bookingStatus: BookingStatus,
  ): Promise<Booking> {
    if (
      !Object.values(BookingStatus).includes(bookingStatus) ||
      bookingStatus === BookingStatus.NEW
    ) {
      throw new BadRequestException('booking status is invalid!');
    }

    const existedBooking = await this.bookingRepository.findOne({
      where: {
        id: bookingId,
      },
      relations: {
        user: isUser(user) ? true : undefined,
        hotel: isHotel(user) ? { user: true } : undefined,
      },
    });

    if (!existedBooking) {
      throw new NotFoundException('Booking does not exist.');
    }

    // Only allows user to cancel booking
    if (
      isUser(user) &&
      (existedBooking.user.id !== user.id ||
        bookingStatus !== BookingStatus.CANCEL ||
        (existedBooking.status !== BookingStatus.NEW &&
          existedBooking.status !== BookingStatus.PAID) ||
        existedBooking.dateFrom < new Date())
    ) {
      throw new ForbiddenException();
    }

    if (
      isHotel(user) &&
      (existedBooking.hotel.user.id !== user.id ||
        // Allow hotel to check in booking online
        (existedBooking.type === BookingType.ONLINE &&
          (bookingStatus !== BookingStatus.CHECK_IN ||
            existedBooking.status !== BookingStatus.PAID ||
            existedBooking.dateFrom > new Date())) ||
        // Allow hotel to cancel booking directly
        (existedBooking.type === BookingType.DIRECTLY &&
          bookingStatus !== BookingStatus.CANCEL))
    ) {
      throw new ForbiddenException();
    }

    // after payment => update status = PAID
    existedBooking.status = bookingStatus;

    return this.bookingRepository.save(existedBooking);
  }

  async update(
    user: JwtPayloadType,
    bookingId: string,
    updateBookingDto: UpdateBookingDto,
  ): Promise<Booking> {
    const existedBooking = await this.bookingRepository.findOne({
      where: {
        id: bookingId,
        user: { id: user.id },
      },
      relations: {
        user: true,
      },
    });

    if (!existedBooking) {
      throw new ForbiddenException();
    }

    this.bookingRepository.merge(existedBooking, updateBookingDto);

    return this.bookingRepository.save(existedBooking);
  }

  // async delete(bookingId: string): Promise<void> {
  //   const deletedBooking = await this.bookingRepository.delete(bookingId);
  //   if (!deletedBooking.affected) {
  //     throw new NotFoundException('Booking not found.');
  //   }
  // }

  private async checkConflictBookingTime(
    roomId: string,
    totalRoom: number,
    dateFrom: Date,
    dateTo: Date,
  ): Promise<boolean> {
    return (
      totalRoom <=
      (await this.bookingRepository
        .createQueryBuilder('b')
        .where('b.roomId = :roomId', { roomId })
        .andWhere('b.status != :bookingStatus', {
          bookingStatus: BookingStatus.CANCEL,
        })
        .andWhere(
          new Brackets((qb) =>
            qb
              .where('b.dateFrom <= :dateFrom and b.dateTo > :dateFrom', {
                dateFrom,
              })
              .orWhere('b.dateFrom < :dateTo and b.dateTo >= :dateTo', {
                dateTo,
              })
              .orWhere('b.dateFrom > :dateFrom and b.dateTo < :dateTo', {
                dateFrom,
                dateTo,
              }),
          ),
        )
        .getCount())
    );
  }

  private getFindManyOption(
    user: JwtPayloadType,
    searchBookingDto: SearchBookingDto,
  ): FindManyOptions<Booking> {
    const whereOptions: FindOptionsWhere<Booking> = {
      user: isUser(user)
        ? { id: user.id }
        : isHotel(user)
          ? {
              email: searchBookingDto.userEmail && searchBookingDto.userEmail,
              phoneNumber:
                searchBookingDto.userPhone && searchBookingDto.userPhone,
            }
          : undefined,
      hotel: isHotel(user) && {
        user: { id: user.id },
      },
      room: searchBookingDto.roomId && { id: searchBookingDto.roomId },
      status: searchBookingDto.status && searchBookingDto.status,
      dateFrom:
        searchBookingDto.dateFrom && MoreThanOrEqual(searchBookingDto.dateFrom),
      dateTo:
        searchBookingDto.dateTo && LessThanOrEqual(searchBookingDto.dateTo),
    };

    return {
      where: whereOptions,
    };
  }
}
