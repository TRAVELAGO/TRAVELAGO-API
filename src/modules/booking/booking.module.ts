import { Module } from '@nestjs/common';
import { BookingService } from './booking.service';
import { BookingController } from './booking.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking } from './booking.entity';
import { RoomModule } from '@modules/room/room.module';
import { JwtStrategy } from '@modules/auth/strategies/jwt.strategy';

@Module({
  imports: [TypeOrmModule.forFeature([Booking]), RoomModule],
  controllers: [BookingController],
  providers: [BookingService, JwtStrategy],
})
export class BookingModule {}
