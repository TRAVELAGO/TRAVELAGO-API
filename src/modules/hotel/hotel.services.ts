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

  async create(hotelData: Partial<Hotel>): Promise<Hotel> {
    const hotel = this.hotelRepository.create(hotelData);
    return this.hotelRepository.save(hotel);
  }

  async findAll(): Promise<Hotel[]> {
    return this.hotelRepository.find();
  }

  async findOne(id: string): Promise<Hotel> {
    return this.hotelRepository.findOne({
      where: { id: id },
    });
  }

  async update(id: string, hotelData: Partial<Hotel>): Promise<Hotel> {
    await this.hotelRepository.update(id, hotelData);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.hotelRepository.delete(id);
  }

  async createHotel(hotelDto: HotelDto): Promise<Hotel> {
    console.log('1');
    const hotel = await this.hotelRepository.findOne({
      where: {
        name: hotelDto.name,
        address: hotelDto.address,
      },
    });
    console.log('1.5');
    if (hotel) {
      console.log('2');
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
      console.log('3');
      return await this.hotelRepository.save(createdHotel);
    }
  }
}
