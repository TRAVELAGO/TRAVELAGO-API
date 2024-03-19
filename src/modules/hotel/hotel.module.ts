import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Hotel } from '@modules/hotel/hotel.entity';
import { HotelController } from './hotel.controller';
import { HotelService } from './hotel.services';

@Module({
  imports: [TypeOrmModule.forFeature([Hotel])],
  controllers: [HotelController],
  providers: [HotelService],
})
export class HotelModule {}
