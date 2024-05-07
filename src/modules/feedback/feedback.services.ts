import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Double, In, MoreThanOrEqual, Repository } from 'typeorm';
import { Feedback } from './feedback.entity';
import { CreateFeedbackDto } from './dtos/create-feedback.dto';
import { User } from '../user/user.entity';
import { Booking } from '@modules/booking/booking.entity';
import { Room } from '@modules/room/room.entity';
import { Hotel } from '@modules/hotel/hotel.entity';
import { BookingStatus } from '@constants/booking-status';
import { FeedbackStatus } from '@constants/feedback-status';
import { ReplyFeedbackDto } from './dtos/feedbackHotelReply.Dto';
import { RoleType } from '@constants/role-type';
import { City } from '@modules/city/city.entity';

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
    // @InjectRepository(City)
    // private readonly cityRepository: Repository<City>,
  ) { }

  async createFeedback(feedbackData: CreateFeedbackDto): Promise<Feedback> {
    const feedback = this.feedbackRepository.create(feedbackData);
    return await this.feedbackRepository.save(feedback);
  }

  async getAllFeedbacks(idUser: string): Promise<Feedback[]> {
    return await this.feedbackRepository.find({
      where: { user: { id: idUser }, userSend: RoleType.USER }
    });
  }

  async getAllReply(idUser: string): Promise<Feedback[]> {
    return await this.feedbackRepository.find({
      where: { user: { id: idUser }, userSend: RoleType.HOTEL }
    });
  }

  async hotelGetAllFeedbacks(idUser: string): Promise<Feedback[]> {

    const hotels = this.hotelRepository.find({
      where: {user: {id: idUser}}
    })
    const hotelIds = (await hotels).map(hotel => hotel.id)
    console.log(hotelIds)
    console.log("121")
    const rooms = await this.roomRepository.find({
      where: { hotel: { id: In(hotelIds) }}
    });
    // const rooms = this.roomRepository.find({
    //   where: { hotel: { id: idHotel } }
    // });
    console.log(rooms)
    const roomIds = (await rooms).map(room => room.id);
    console.log("assa")
    console.log(roomIds)
    const allFeedbacks = await this.feedbackRepository.find({
      where: { room: { id: In(roomIds) }, userSend: RoleType.USER }
    });
    return allFeedbacks;
  }

  async updateFeedback(
    id: string,
    feedbackData: CreateFeedbackDto,
  ): Promise<Feedback> {
    const feedback = await this.feedbackRepository.findOne({
      where: { id: id, userSend: RoleType.USER },
    });
    if (!feedback) {
      throw new Error('Feedback not found');
    }
    Object.assign(feedback, feedbackData);
    return await this.feedbackRepository.save(feedback);
  }

  async create(userId: string, roomId: string, feedbackData: CreateFeedbackDto): Promise<Feedback> {
    const booking = await this.bookingRepository.find({
      where: {
        user: { id: userId },
        room: { id: roomId },
        status: BookingStatus.CHECK_IN,
        // dateTo: MoreThanOrEqual(new Date()),
      },
    });

    if (!booking) {
      throw new NotFoundException('Invalid booking for feedback');
    }

    const reportFeedback = await this.feedbackRepository.create({
      rate: feedbackData.rate,
      comment: feedbackData.comment,
      status: FeedbackStatus.PENDDING,
      userSend: RoleType.USER,
      user: { id: userId },
      room: { id: roomId },
    });

    this.feedbackRepository.save(reportFeedback);

    const room = await this.roomRepository.findOne({
      where: { id: roomId }
    });
    const rate = await this.calculateRoomRate(roomId);
    room.rate = rate;
    await this.roomRepository.save(room);
    const hotel = await this.hotelRepository.findOne({
      where: { rooms: { id: roomId } }
    });
    hotel.rate = await this.calculateHotelRate(hotel.id);
    room.rate = rate;
    await this.hotelRepository.save(hotel);
    return await this.feedbackRepository.save(reportFeedback);
  }


  async calculateRoomRate(roomId: string): Promise<number> {
    const feedbacks = await this.feedbackRepository.find({
      where: {
        room: { id: roomId },
        userSend: RoleType.USER
      },
      select: ['rate']
    });

    const rates = feedbacks.map(feedback => parseFloat((feedback as any).rate));
    const sum = rates.reduce((total, rate) => total + rate, 0);
    const averageRate = rates.length > 0 ? sum / rates.length : 0;
    return averageRate;
  }

  async calculateHotelRate(hotelId: string): Promise<number> {
    const rooms = await this.roomRepository.find({
      where: {
        hotel: { id: hotelId }
      },
      select: ['rate']
    });

    const rates = rooms.map(feedback => feedback.rate);

    const sum = rates.reduce((total, rate) => total + rate, 0);
    const averageRate = rates.length > 0 ? sum / rates.length : 0;

    return averageRate;
  }

  async hotelReplyFeedbacks(hotelId: string, feedbackId: string, replyFeedback: ReplyFeedbackDto) {
    const hotel = await this.hotelRepository.findOne({
      where: { id: hotelId }
    })
    console.log("aaa")
    if (!hotel) {

    }

    const reply = await this.feedbackRepository.create({
      ...replyFeedback,
      userSend: RoleType.HOTEL,
      status: FeedbackStatus.RESOLVED
    }
    )
    
    const savedReply = await this.feedbackRepository.save(reply);
    console.log("bbb");
    const feedback = await this.feedbackRepository.findOne({
      where: { id: feedbackId }
    })
    if (!feedback) {

    } else {
      await this.feedbackRepository.update(
        { id: feedbackId },
        { status: FeedbackStatus.RESOLVED }
      )
    }
    console.log("ccc");
    return savedReply
  }

  async findRoomsByHotel(hotelId: string): Promise<Room[]> {
    return this.roomRepository.find({ where: { hotel: { id: hotelId } } });
  }

  async getSuggestedRooms(userId: string): Promise<Room[]> {
    const bookedRoomIds = await this.getBookedRoomIds(userId);
    const bookedRooms = await this.roomRepository
      .createQueryBuilder('room')
      .whereInIds(bookedRoomIds)
      .innerJoinAndSelect('room.hotel', 'hotel')
      .getMany();
//     console.log("184")
//     console.log(bookedRooms)

//     const hotelEntities: Hotel[] = bookedRooms.map(room => room.hotel);

//     const hotelIds: string[] = bookedRooms.map(room => room.hotel.id);
//     console.log(hotelIds);

//     const citiess = await this.hotelRepository
//       .createQueryBuilder('hotel')
//       .innerJoinAndSelect('hotel.city', 'city')
//       .whereInIds(hotelIds)
//       .getMany();

//     console.log(citiess)
//     console.log("189")

// const cityNames: string[] = citiess.map(hotel => hotel.city.name);

// console.log(cityNames);

//     console.log("192")
//     console.log(cityNames);
    const averagePrice = this.calculateAveragePrice(bookedRooms);
    console.log(averagePrice)
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
      relations: [
        "room"
      ],
    });

    const roomIds = bookings.map((booking) => booking.room.id);
    return roomIds;

  }

  private calculateAveragePrice(rooms: Room[]): number {
    if (rooms.length === 0) {
      return 0;
    }
    let totalAmount: number[] = []
    rooms.forEach(room => {
      totalAmount.push(Number(room.price))
    })
    let total: number = 0
    for(let i =0; i < totalAmount.length; i++) {
      total = total + totalAmount[i];
    }
    const averagePrice = total / rooms.length;
    return averagePrice;
  }
}