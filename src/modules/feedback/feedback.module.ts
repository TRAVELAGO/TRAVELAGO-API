import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Feedback } from './feedback.entity';
import { FeedbackController } from './feedback.controller';
import { FeedbackService } from './feedback.services';
import { HotelModule } from '@modules/hotel/hotel.module';
import { BookingModule } from '@modules/booking/booking.module';
import { RoomModule } from '@modules/room/room.module';

@Module({
  imports: [TypeOrmModule.forFeature([Feedback]), HotelModule, BookingModule, RoomModule],
  controllers: [FeedbackController],
  providers: [FeedbackService],
})
export class FeedbackModule {}
