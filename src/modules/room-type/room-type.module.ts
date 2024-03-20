import { Module } from '@nestjs/common';
import { RoomTypeController } from './room-type.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoomType } from './room-type.entity';
import { RoomTypeService } from './room-type.service';
import { JwtStrategy } from '@modules/auth/strategies/jwt.strategy';

@Module({
  imports: [TypeOrmModule.forFeature([RoomType])],
  controllers: [RoomTypeController],
  providers: [RoomTypeService, JwtStrategy],
})
export class RoomTypeModule {}
