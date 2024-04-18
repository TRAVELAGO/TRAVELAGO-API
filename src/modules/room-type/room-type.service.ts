import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoomType } from './room-type.entity';
import { CreateRoomTypeDto } from './dto/create-room-type.dto';
import { UpdateRoomTypeDto } from './dto/update-room-type.dto';

@Injectable()
export class RoomTypeService {
  constructor(
    @InjectRepository(RoomType)
    private roomTypeRepository: Repository<RoomType>,
  ) {}

  async find(roomTypeId: string): Promise<RoomType> {
    const existedRoomType = await this.roomTypeRepository.findOne({
      where: {
        id: roomTypeId,
      },
    });

    if (!existedRoomType) {
      throw new NotFoundException('Room type id does not exist.');
    }

    return existedRoomType;
  }

  async findAll(): Promise<RoomType[]> {
    return await this.roomTypeRepository.find();
  }

  async create(createRoomTypeDto: CreateRoomTypeDto): Promise<RoomType> {
    return await this.roomTypeRepository.save(createRoomTypeDto);
  }

  async update(
    roomTypeId: string,
    updateRoomTypeDto: UpdateRoomTypeDto,
  ): Promise<RoomType> {
    const existedRoomType = await this.roomTypeRepository.findOne({
      where: {
        id: roomTypeId,
      },
    });

    if (!existedRoomType) {
      throw new NotFoundException('Room type does not exist.');
    }

    this.roomTypeRepository.merge(existedRoomType, updateRoomTypeDto);

    return this.roomTypeRepository.save(existedRoomType);
  }

  async delete(roomTypeId: string): Promise<void> {
    const deletedRoomType = await this.roomTypeRepository.delete(roomTypeId);
    if (!deletedRoomType.affected) {
      throw new NotFoundException('Room type not found.');
    }
  }
}
