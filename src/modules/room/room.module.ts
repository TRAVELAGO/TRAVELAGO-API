import { Module } from '@nestjs/common';
import { RoomController } from './room.controller';
import { RoomService } from './room.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Room } from './room.entity';
import { Hotel } from '@modules/hotel/hotel.entity';
import { RoomType } from '@modules/room-type/room-type.entity';
import { JwtStrategy } from '@modules/auth/strategies/jwt.strategy';

@Module({
  imports: [TypeOrmModule.forFeature([Room, Hotel, RoomType])],
  controllers: [RoomController],
  providers: [RoomService, JwtStrategy],
})
export class RoomModule {}
