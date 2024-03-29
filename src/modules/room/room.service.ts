import { UpdateRoomDto } from './dtos/update-room.dto';
import { Hotel } from '@modules/hotel/hotel.entity';
import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  FindManyOptions,
  FindOptionsWhere,
  Like,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { Room } from './room.entity';
import { CreateRoomDto } from './dtos/create-room.dto';
import { RoomType } from '@modules/room-type/room-type.entity';
import { getOrderOption, getPaginationOption } from 'src/utils/pagination';
import { SearchRoomDto } from './dtos/seach-room.dto';
import { between, findInJsonArray } from 'src/utils/find-option';
import { PageDto } from 'src/common/dtos/page.dto';
import { PageMetaDto } from 'src/common/dtos/page-meta.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RoomService {
  constructor(
    @InjectRepository(Room) private roomRepository: Repository<Room>,
    @InjectRepository(RoomType)
    private roomTypeRepository: Repository<RoomType>,
    @InjectRepository(Hotel) private hotelRepository: Repository<Hotel>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private configService: ConfigService,
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

  async search(
    searchRoomDto: SearchRoomDto,
    hotelId?: string,
  ): Promise<PageDto<Room>> {
    const findManyOption: FindManyOptions<Room> = this.getFindManyOption(
      searchRoomDto,
      hotelId,
    );

    const [rooms, itemCount] = await this.roomRepository.findAndCount({
      ...findManyOption,
      ...getPaginationOption<Room>(
        searchRoomDto.pageNumber,
        searchRoomDto.pageSize,
      ),
      ...(await getOrderOption<Room>(
        Room,
        searchRoomDto.order,
        this.cacheManager,
      )),
    });

    // create metadata
    const pageMetaDto = new PageMetaDto({
      itemCount,
      pageOptionsDto: searchRoomDto,
    });

    // add data to PageDto
    return new PageDto(rooms, pageMetaDto);
  }

  async create(
    userId: string,
    hotelId: string,
    createRoomDto: CreateRoomDto,
  ): Promise<Room> {
    const newRoom = this.roomRepository.create({
      ...createRoomDto,
      currentAvailable: createRoomDto.total,
    });

    const existedHotel = await this.hotelRepository
      .createQueryBuilder('hotel')
      .where('hotel.id = :hotelId', { hotelId: hotelId })
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

  private getFindManyOption(
    searchRoomDto: SearchRoomDto,
    hotelId: string,
  ): FindManyOptions<Room> {
    const whereOptions: FindOptionsWhere<Room> = {
      hotel: hotelId
        ? {
            id: hotelId,
          }
        : undefined,
      name: searchRoomDto.name ? Like(`%${searchRoomDto.name}%`) : undefined,
      price: between(searchRoomDto.priceFrom, searchRoomDto.priceTo),
      area: between(searchRoomDto.areaFrom, searchRoomDto.areaTo),
      currentAvailable: searchRoomDto.currentAvailable
        ? MoreThanOrEqual(searchRoomDto.currentAvailable)
        : undefined,
      total: searchRoomDto.total,
      rate: searchRoomDto.rate
        ? MoreThanOrEqual(searchRoomDto.rate)
        : undefined,
      roomType: searchRoomDto.roomTypeId
        ? {
            id: searchRoomDto.roomTypeId,
          }
        : undefined,
      roomAmenities: findInJsonArray(
        searchRoomDto.roomAmenities,
        this.configService.get<string>('DB_TYPE'),
      ),
    };

    return {
      where: whereOptions,
    };
  }
}
