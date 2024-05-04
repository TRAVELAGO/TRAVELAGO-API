import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, MoreThanOrEqual, Repository } from 'typeorm';
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
  ) {}

  async createFeedback(feedbackData: CreateFeedbackDto): Promise<Feedback> {
    const feedback = this.feedbackRepository.create(feedbackData);
    return await this.feedbackRepository.save(feedback);
  }

  async getAllFeedbacks(idUser: string): Promise<Feedback[]> {
    return await this.feedbackRepository.find({
      where: {user: {id:idUser}, userSend: RoleType.USER}});
  }
  
  async getAllReply(idUser: string): Promise<Feedback[]> {
    return await this.feedbackRepository.find({
      where: {user: {id:idUser}, userSend: RoleType.HOTEL}});
  }

  async hotelGetAllFeedbacks(idHotel: string): Promise<Feedback[]> {
    const rooms = this.roomRepository.find({
      where: {hotel: {id:idHotel}}});
    const roomIds = (await rooms).map(room => room.id);
    const allFeedbacks = await this.feedbackRepository.find({
      where: { room: { id: In(roomIds) } , userSend: RoleType.USER}
    });
    return allFeedbacks;
  }

  async updateFeedback(
    id: string,
    feedbackData: CreateFeedbackDto,
  ): Promise<Feedback> {
    const feedback = await this.feedbackRepository.findOne({
      where: { id: id , userSend: RoleType.USER},
    });
    if (!feedback) {
      throw new Error('Feedback not found');
    }
    Object.assign(feedback, feedbackData);
    return await this.feedbackRepository.save(feedback);
  }

  async create(userId: string, roomId: string, feedbackData: CreateFeedbackDto): Promise<Feedback> {
    const booking = await this.bookingRepository.findOne({
      where: {
        user: {id:userId},
        room: {id: roomId},
        status: BookingStatus.CHECK_IN,
        dateTo: MoreThanOrEqual(new Date()),
      },
    });

    if (!booking) {
      throw new NotFoundException('Invalid booking for feedback');
    }

    const reportFeedback = await this.feedbackRepository.create({
      ...feedbackData,
      status: FeedbackStatus.PENDDING,
      userSend: RoleType.USER
    });

    const room = await this.roomRepository.findOne({
      where: {id: roomId}
    });
    const rate = await this.calculateRoomRate(roomId); 
    await this.roomRepository.save(room);

    const hotel = await this.hotelRepository.findOne({
      where: {rooms: {id: roomId}}
    });
    hotel.rate = await this.calculateHotelRate(hotel.id); 
    room.rate = rate;
    await this.hotelRepository.save(hotel);

    return await this.feedbackRepository.save(reportFeedback);
  }


  async calculateRoomRate(roomId: string): Promise<number>  {
    const feedbacks = await this.feedbackRepository.find({
      where: {
        room: { id: roomId },
        userSend: RoleType.USER
      },
      select: ['rate']
    }); 

    const rates = feedbacks.map(feedback => feedback.rate);

    const averageRate = rates.reduce((total, rate) => total + rate, 0) / rates.length;

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

    const averageRate = rates.reduce((total, rate) => total + rate, 0) / rates.length;

    return averageRate;
  }

  async hotelReplyFeedbacks(hotelId: string, feedbackId: string, replyFeedback: ReplyFeedbackDto) {
    const hotel = await this.hotelRepository.findOne({
      where: {id: hotelId}
    })

    if(!hotel) {

    }

    const reply = await this.feedbackRepository.create({
      ...replyFeedback,
      userSend: RoleType.HOTEL
    }
    )
    const savedReply = await this.feedbackRepository.save(reply);

    const feedback = await this.feedbackRepository.findOne({
      where: {id: feedbackId}
    })
    if(!feedback) {

    } else {
      await this.feedbackRepository.update(
        {id: feedbackId},
        {status: FeedbackStatus.RESOLVED}
      )
    }

    return savedReply
  }
}