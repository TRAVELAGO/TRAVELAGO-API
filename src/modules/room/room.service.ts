import { UpdateRoomDto } from './dtos/update-room.dto';
import { Hotel } from '@modules/hotel/hotel.entity';
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Repository } from 'typeorm';
import { Room } from './room.entity';
import { CreateRoomDto } from './dtos/create-room.dto';
import { RoomType } from '@modules/room-type/room-type.entity';
import { getPaginationOption } from 'src/utils/pagination';

@Injectable()
export class RoomService {
  constructor(
    @InjectRepository(Room) private roomRepository: Repository<Room>,
    @InjectRepository(RoomType)
    private roomTypeRepository: Repository<RoomType>,
    @InjectRepository(Hotel) private hotelRepository: Repository<Hotel>,
  ) {}

  async find(roomId: string): Promise<Room> {
    const existedRoom = await this.roomRepository.findOne({
      where: {
        id: roomId,
      },
    });

    if (!existedRoom) {
      throw new NotFoundException('Room id does not exist.');
    }

    return existedRoom;
  }

  async findAll(pageNumber?: number, pageSize?: number): Promise<Room[]> {
    const findManyOption: FindManyOptions = getPaginationOption(
      pageNumber,
      pageSize,
    );

    return await this.roomRepository.find(findManyOption);
  }

  async create(userId: string, createRoomDto: CreateRoomDto): Promise<Room> {
    const newRoom = this.roomRepository.create({
      ...createRoomDto,
      currentAvailable: createRoomDto.total,
    });

    const existedHotel = await this.hotelRepository
      .createQueryBuilder('hotel')
      .where('hotel.id = :hotelId', { hotelId: createRoomDto.hotelId })
      .andWhere('hotel.userId = :userId', { userId })
      .getOne();

    if (!existedHotel) {
      throw new NotFoundException('Hotel does not exist.');
    }

    const existedRoomType = await this.roomTypeRepository.findOne({
      where: {
        id: createRoomDto.roomTypeId,
      },
    });

    if (!existedRoomType) {
      throw new NotFoundException('Room type does not exist.');
    }

    newRoom.hotel = existedHotel;
    newRoom.roomType = existedRoomType;

    return this.roomRepository.save(newRoom);
  }

  async update(
    userId: string,
    roomId: string,
    updateRoomDto: UpdateRoomDto,
  ): Promise<Room> {
    const existedRoom = await this.roomRepository.findOne({
      where: {
        id: roomId,
      },
    });

    if (!existedRoom) {
      throw new NotFoundException('Room id does not exist.');
    }

    const hotelExists = await this.checkHotelExists(userId, roomId);
    if (!hotelExists) {
      throw new ForbiddenException();
    }

    if (updateRoomDto.roomTypeId) {
      const existedRoomType = await this.roomTypeRepository.findOne({
        where: { id: updateRoomDto.roomTypeId },
      });

      if (!existedRoomType) {
        throw new NotFoundException('Room Type does not exist.');
      }

      existedRoom.roomType = existedRoomType;
    }

    this.roomRepository.merge(existedRoom, updateRoomDto);

    return this.roomRepository.save(existedRoom);
  }

  async delete(userId: string, roomId: string): Promise<void> {
    const hotelExists = await this.checkHotelExists(userId, roomId);
    if (!hotelExists) {
      throw new ForbiddenException();
    }

    const deletedRoom = await this.roomRepository.delete(roomId);
    if (!deletedRoom.affected) {
      throw new NotFoundException('Room not found.');
    }
  }

  private async checkHotelExists(
    userId: string,
    roomId: string,
  ): Promise<boolean> {
    return (
      (await this.hotelRepository
        .createQueryBuilder('hotel')
        .innerJoin(Room, 'room', 'room.hotelId = hotel.id')
        .where('room.id = :roomId', { roomId })
        .andWhere('hotel.userId = :userId', { userId })
        .select('hotel')
        .getCount()) > 0
    );
  }
}
