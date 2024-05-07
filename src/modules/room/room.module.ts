import { Module } from '@nestjs/common';
import { RoomController } from './room.controller';
import { RoomService } from './room.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Room } from './room.entity';
import { JwtStrategy } from '@modules/auth/strategies/jwt.strategy';
import { RoomTypeModule } from '@modules/room-type/room-type.module';
import { HotelModule } from '@modules/hotel/hotel.module';
import { BookingModule } from '@modules/booking/booking.module';

@Module({
  imports: [TypeOrmModule.forFeature([Room]), RoomTypeModule, HotelModule],
  controllers: [RoomController],
  providers: [RoomService, JwtStrategy],
  exports: [RoomService, TypeOrmModule],
})
export class RoomModule {}
