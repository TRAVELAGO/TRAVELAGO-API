import {
  Controller,
  Post,
  Body,
  Get,
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

  @Get()
  findAll(): Promise<Hotel[]> {
    return this.hotelService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Hotel> {
    return this.hotelService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() hotelData: Partial<Hotel>,
  ): Promise<Hotel> {
    return this.hotelService.update(id, hotelData);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.hotelService.remove(id);
  }

  @Post('createHotel')
  createHotel(@Body() hotelDto: HotelDto): Promise<Hotel> {
    console.log('create hotel api');
    return this.hotelService.createHotel(hotelDto);
  }

  @Get('/search/:cityid')
  async findByCity(@Param('cityid') cityid: string): Promise<Hotel[]> {
    return this.hotelService.findHotelsByCity(cityid);
  }
}
