import { Module } from '@nestjs/common';
import { RoomController } from './room.controller';
import { RoomService } from './room.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Room } from './room.entity';
import { JwtStrategy } from '@modules/auth/strategies/jwt.strategy';
import { RoomTypeModule } from '@modules/room-type/room-type.module';
import { HotelModule } from '@modules/hotel/hotel.module';

@Module({
  imports: [TypeOrmModule.forFeature([Room]), RoomTypeModule, HotelModule],
  controllers: [RoomController],
  providers: [RoomService, JwtStrategy],
})
export class RoomModule {}
