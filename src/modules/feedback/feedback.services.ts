import { getPaginationOption, getOrderOption } from 'src/utils/pagination';
import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DataSource,
  FindManyOptions,
  In,
  LessThanOrEqual,
  QueryRunner,
  Repository,
} from 'typeorm';
import { Feedback } from './feedback.entity';
import { CreateFeedbackDto } from './dtos/create-feedback.dto';
import { Booking } from '@modules/booking/booking.entity';
import { Room } from '@modules/room/room.entity';
import { Hotel } from '@modules/hotel/hotel.entity';
import { FeedbackStatus } from '@constants/feedback-status';
import { PageOptionsDto } from 'src/common/dtos/page-option.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { PageDto } from 'src/common/dtos/page.dto';
import { PageMetaDto } from 'src/common/dtos/page-meta.dto';
import { format, toZonedTime } from 'date-fns-tz';
import { VN_TIME_ZONE } from '@constants/constants';
import { BookingStatus } from '@constants/booking-status';
import { TypeUpdateRate } from '@constants/type-update-rate';
import { UpdateFeedbackDto } from './dtos/update-feedback.dto';

@Injectable()
export class FeedbackService {
  constructor(
    @InjectRepository(Feedback)
    private feedbackRepository: Repository<Feedback>,
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    @InjectRepository(Room)
    private readonly roomRepository: Repository<Room>,
    @InjectRepository(Hotel)
    private readonly hotelRepository: Repository<Hotel>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private dataSource: DataSource,
  ) {}

  public async getFeedbackById(feedbackId: string): Promise<Feedback> {
    const feedback = await this.feedbackRepository.findOne({
      where: { id: feedbackId },
    });

    return feedback;
  }

  public async getFeedbacksOfRoom(
    roomId: string,
    pageOptionsDto: PageOptionsDto,
  ): Promise<PageDto<Feedback>> {
    const findFeedbackOfRoomOptions: FindManyOptions<Feedback> = {
      where: {
        room: { id: roomId },
      },
    };
    return this.getFeedbacks(findFeedbackOfRoomOptions, pageOptionsDto);
  }

  public async getFeedbacksOfHotel(
    hotelId: string,
    pageOptionsDto: PageOptionsDto,
  ): Promise<PageDto<Feedback>> {
    const findFeedbackOfHotelOptions: FindManyOptions<Feedback> = {
      where: {
        room: { hotel: { id: hotelId } },
      },
    };
    return this.getFeedbacks(findFeedbackOfHotelOptions, pageOptionsDto);
  }

  private async getFeedbacks(
    findFeedbackOptions: FindManyOptions<Feedback>,
    pageOptionsDto: PageOptionsDto,
  ): Promise<PageDto<Feedback>> {
    const [feedbacks, itemCount] = await this.feedbackRepository.findAndCount({
      ...findFeedbackOptions,
      ...getPaginationOption(
        pageOptionsDto.pageNumber,
        pageOptionsDto.pageSize,
      ),
      ...(await getOrderOption(
        Feedback,
        pageOptionsDto.order,
        this.cacheManager,
      )),
    });

    const pageMetaDto = new PageMetaDto({
      itemCount,
      pageOptionsDto,
    });

    return new PageDto(feedbacks, pageMetaDto);
  }

  public async updateFeedback(
    feedbackId: string,
    userId: string,
    updateFeedbackDto: UpdateFeedbackDto,
  ): Promise<Feedback> {
    const feedback = await this.feedbackRepository
      .createQueryBuilder('f')
      .where('id = :feedbackId', { feedbackId })
      .andWhere('userId = :userId', { userId })
      .select('id, rate, comment, status, roomId, createdAt, updatedAt')
      .getRawOne();

    if (!feedback) {
      throw new ForbiddenException();
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      if (updateFeedbackDto.rate && updateFeedbackDto.rate !== feedback.rate) {
        const differenceFeedbackRate = updateFeedbackDto.rate - feedback.rate;
        await this.updateRoomRate(
          queryRunner,
          feedback.roomId,
          differenceFeedbackRate,
          TypeUpdateRate.UPDATE_FEEDBACK,
        );
      }

      this.feedbackRepository.merge(feedback, updateFeedbackDto);
      queryRunner.manager.update(Feedback, feedback.id, updateFeedbackDto);
      await queryRunner.commitTransaction();

      return feedback;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  public async deleteFeedback(
    feedbackId: string,
    userId: string,
  ): Promise<Feedback> {
    const feedback = await this.feedbackRepository
      .createQueryBuilder('f')
      .where('id = :feedbackId', { feedbackId })
      .andWhere('userId = :userId', { userId })
      .select('id, rate, comment, status, roomId, createdAt, updatedAt')
      .getRawOne();

    if (!feedback) {
      throw new ForbiddenException();
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await this.updateRoomRate(
        queryRunner,
        feedback.roomId,
        feedback.rate,
        TypeUpdateRate.DELETE_FEEDBACK,
      );
      await queryRunner.manager.delete(Feedback, feedbackId);
      await queryRunner.commitTransaction();

      return feedback;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  public async create(
    userId: string,
    roomId: string,
    feedbackData: CreateFeedbackDto,
  ): Promise<Feedback> {
    const booking = await this.bookingRepository.findOne({
      where: {
        user: { id: userId },
        room: { id: roomId },
        isFeedback: false,
        dateTo: LessThanOrEqual(
          format(toZonedTime(new Date(), VN_TIME_ZONE), 'yyyy-MM-dd'),
        ),
        status: In([BookingStatus.PAID, BookingStatus.CHECK_IN]),
      },
      select: {
        id: true,
      },
    });

    if (!booking) {
      throw new ForbiddenException();
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const newFeedback = await this.feedbackRepository.create({
        rate: feedbackData.rate,
        comment: feedbackData.comment,
        status: FeedbackStatus.NEW,
        user: { id: userId },
        room: { id: roomId },
        booking: { id: booking.id },
      });

      await queryRunner.manager.update(Booking, booking.id, {
        isFeedback: true,
      });
      await this.updateRoomRate(
        queryRunner,
        roomId,
        newFeedback.rate,
        TypeUpdateRate.NEW_FEEDBACK,
      );
      await queryRunner.manager.save(newFeedback);
      await queryRunner.commitTransaction();

      return newFeedback;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  public async reportFeedback(feedbackId: string) {
    const existedFeedback = await this.feedbackRepository.findOne({
      where: { id: feedbackId },
      select: {
        id: true,
        status: true,
      },
    });

    if (!existedFeedback) {
      throw new NotFoundException('Feedback not exists.');
    }
    if (existedFeedback.status === FeedbackStatus.VALID) {
      throw new BadRequestException('Cannot report feedback.');
    }
    if (existedFeedback.status === FeedbackStatus.REPORTED) {
      return;
    }

    await this.feedbackRepository.update(feedbackId, {
      status: FeedbackStatus.REPORTED,
    });
  }

  public async updateRoomRate(
    queryRunner: QueryRunner,
    roomId: string,
    differenceFeedbackRate: number,
    typeUpdate: TypeUpdateRate,
  ): Promise<void> {
    const existedRoom: {
      hotelId: string;
      rate: any;
    } = await this.roomRepository
      .createQueryBuilder('r')
      .select('hotelId, rate')
      .where('r.id = :roomId', { roomId })
      .getRawOne();

    const countFeedbacks = await this.feedbackRepository.count({
      where: {
        room: { id: roomId },
      },
    });

    const rateAdjustment =
      typeUpdate === TypeUpdateRate.DELETE_FEEDBACK
        ? -1
        : typeUpdate === TypeUpdateRate.NEW_FEEDBACK
          ? 1
          : 0;
    const newRoomRate =
      countFeedbacks > 0
        ? countFeedbacks + rateAdjustment > 0
          ? (Number(existedRoom.rate) * countFeedbacks +
              (rateAdjustment !== 0
                ? rateAdjustment * differenceFeedbackRate
                : differenceFeedbackRate)) /
            (countFeedbacks + rateAdjustment)
          : null
        : differenceFeedbackRate;

    await queryRunner.manager.update(Room, roomId, {
      rate: newRoomRate,
    });
    await this.updateHotelRate(
      queryRunner,
      existedRoom.hotelId,
      roomId,
      newRoomRate,
    );
  }

  public async updateHotelRate(
    queryRunner: QueryRunner,
    hotelId: string,
    roomId: string,
    newRoomRate: number,
  ): Promise<void> {
    const listRoomRated: {
      rate: string;
    }[] = await this.roomRepository
      .createQueryBuilder('r')
      .select('r.rate as rate')
      .where('r.rate IS NOT NULL')
      .andWhere('r.hotelId = :hotelId', { hotelId })
      .andWhere('r.id <> :roomId', { roomId })
      .getRawMany();
    let sumRoomRate = newRoomRate;
    listRoomRated.forEach(
      (roomRated) => (sumRoomRate += Number(roomRated.rate)),
    );

    const averageRoomRate = sumRoomRate / (listRoomRated.length + 1);
    await queryRunner.manager.update(Hotel, hotelId, {
      rate: averageRoomRate > 0 ? averageRoomRate : null,
    });
  }

  public async getSuggestedRooms(userId: string): Promise<Room[]> {
    const bookedRoomIds = await this.getBookedRoomIds(userId);
    const bookedRooms = await this.roomRepository
      .createQueryBuilder('room')
      .whereInIds(bookedRoomIds)
      .innerJoinAndSelect('room.hotel', 'hotel')
      .getMany();

    const averagePrice = this.calculateAveragePrice(bookedRooms);
    const threshold = 30000;

    const suggestedRooms = await this.roomRepository
      .createQueryBuilder('room')
      .where('ABS(room.price - :averagePrice) < :threshold', {
        averagePrice: averagePrice,
        threshold: threshold,
      })
      .getMany();
    return suggestedRooms;
  }

  private async getBookedRoomIds(userId: string): Promise<string[]> {
    const bookings = await this.bookingRepository.find({
      where: { user: { id: userId } },
      relations: ['room'],
    });

    const roomIds = bookings.map((booking) => booking.room.id);
    return roomIds;
  }

  private calculateAveragePrice(rooms: Room[]): number {
    if (rooms.length === 0) {
      return 0;
    }
    const totalAmount: number[] = [];
    rooms.forEach((room) => {
      totalAmount.push(Number(room.price));
    });
    let total: number = 0;
    for (let i = 0; i < totalAmount.length; i++) {
      total = total + totalAmount[i];
    }
    const averagePrice = total / rooms.length;
    return averagePrice;
  }
}
