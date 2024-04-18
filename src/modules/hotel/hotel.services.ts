import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Hotel } from '@modules/hotel/hotel.entity';
import { HotelDto } from './dtos/hotel.dto';
import { HotelStatus } from '@constants/hotel-status';
import { UpdateHotelDto } from './dtos/update-hotel.dto';
import { FilesService } from '@modules/files/files.service';

@Injectable()
export class HotelService {
  constructor(
    @InjectRepository(Hotel) private hotelRepository: Repository<Hotel>,
    private filesService: FilesService,
  ) {}

  async findAll(): Promise<Hotel[]> {
    return this.hotelRepository.find();
  }

  async findOne(id: string): Promise<Hotel> {
    const existedHotel = await this.hotelRepository.findOne({
      where: { id },
    });

    if (!existedHotel) {
      throw new NotFoundException('Hotel id does not exist.');
    }

    return existedHotel;
  }

  async update(
    id: string,
    userId: string,
    updateHotelDto: UpdateHotelDto,
  ): Promise<Hotel> {
    const existedHotel = await this.hotelRepository.findOne({
      where: {
        id,
      },
      relations: ['user'],
    });

    if (!existedHotel) {
      throw new NotFoundException('Hotel does not exists.');
    }

    if (existedHotel.user.id !== userId) {
      throw new ForbiddenException();
    }

    this.hotelRepository.merge(existedHotel, updateHotelDto);

    return this.hotelRepository.save(existedHotel);
  }

  async remove(id: string, userId: string): Promise<void> {
    const hotelExists = await this.hotelRepository.exists({
      where: {
        id,
        user: { id: userId },
      },
    });

    if (!hotelExists) {
      throw new ForbiddenException();
    }

    const deletedHotel = await this.hotelRepository.delete(id);

    if (!deletedHotel.affected) {
      throw new InternalServerErrorException();
    }
  }

  async create(
    userId: string,
    images: any,
    hotelDto: HotelDto,
  ): Promise<Hotel> {
    const hotelExists = await this.hotelRepository.exists({
      where: {
        name: hotelDto.name,
        user: { id: userId },
      },
    });

    if (hotelExists) {
      throw new BadRequestException('The hotel already exists.');
    }

    const uploadedImages = images
      ? await this.filesService.uploadFiles(images)
      : [];

    const createdHotel = await this.hotelRepository.create({
      status: HotelStatus.OPEN,
      ...hotelDto,
      user: { id: userId },
      images: uploadedImages,
    });

    return this.hotelRepository.save(createdHotel);
  }
  async findHotelsByCity(cityid: string): Promise<Hotel[]> {
    return this.hotelRepository.find({ where: { city: { id: cityid } } });
  }
}
