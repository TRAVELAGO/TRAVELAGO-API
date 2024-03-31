import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { Hotel } from '@modules/hotel/hotel.entity';
import { HotelDto } from './dtos/hotelDto';

@Injectable()
export class HotelService {
  constructor(
    @InjectRepository(Hotel) private hotelRepository: Repository<Hotel>,
  ) {}

  async createHotel(hotelDto: HotelDto): Promise<Hotel> {
    const hotel = await this.hotelRepository.findOne({
      where: {
        name: hotelDto.name,
        address: hotelDto.address,
      },
    });

    if (hotel) {
      throw new BadRequestException('The hotel already exists.');
    } else {
      // const newHotel = this.hotelRepository.create(hotelDto as unknown as DeepPartial<Hotel>);

      const newHotel: DeepPartial<Hotel> = {
        name: hotelDto.name,
        address: hotelDto.address,
        description: hotelDto.description,
        status: hotelDto.status,
      };

      const createdHotel = await this.hotelRepository.create(newHotel);

      return await this.hotelRepository.save(createdHotel);
    }
  }
}
