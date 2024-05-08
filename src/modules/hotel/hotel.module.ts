import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Hotel } from './hotel.entity';
import { HotelController } from './hotel.controller';
import { HotelService } from './hotel.services';
import { RoomModule } from '@modules/room/room.module';
import { BookingModule } from '@modules/booking/booking.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Hotel]),
    forwardRef(() => RoomModule),
    BookingModule,
  ],
  controllers: [HotelController],
  providers: [HotelService],
  exports: [TypeOrmModule],
})
export class HotelModule {}
