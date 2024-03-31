import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { HotelService } from './hotel.services';
import { Hotel } from '@modules/hotel/hotel.entity';
import { ApiTags } from '@nestjs/swagger';
import { HotelDto } from './dtos/hotelDto';

@ApiTags('Hotel')
@Controller('hotels')
export class HotelController {
  constructor(private hotelService: HotelService) {}


  @Post('createHotel')
  createHotel(@Body() hotelDto: HotelDto): Promise<Hotel> {
    console.log('create hotel api');
    return this.hotelService.createHotel(hotelDto);
  }
}
