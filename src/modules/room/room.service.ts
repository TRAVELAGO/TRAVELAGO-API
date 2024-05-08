import { SearchRoomAvailableDto } from './dtos/search-room-available.dto';
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
  DataSource,
  FindManyOptions,
  FindOptionsWhere,
  Like,
  MoreThanOrEqual,
  Repository,
  WhereExpressionBuilder,
} from 'typeorm';
import { Room } from './room.entity';
import { CreateRoomDto } from './dtos/create-room.dto';
import { RoomType } from '@modules/room-type/room-type.entity';
import { getOrderOption, getPaginationOption } from 'src/utils/pagination';
import { SearchRoomDto } from './dtos/search-room.dto';
import {
  between,
  findInJsonArray,
  getQueryInJsonArray,
} from 'src/utils/find-option';
import { PageDto } from 'src/common/dtos/page.dto';
import { PageMetaDto } from 'src/common/dtos/page-meta.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { ConfigService } from '@nestjs/config';
import { FilesService } from '@modules/files/files.service';
import { Booking } from '@modules/booking/booking.entity';
import { BookingStatus } from '@constants/booking-status';

@Injectable()
export class RoomService {
  constructor(
    @InjectRepository(Room) private roomRepository: Repository<Room>,
    @InjectRepository(RoomType)
    private roomTypeRepository: Repository<RoomType>,
    @InjectRepository(Hotel) private hotelRepository: Repository<Hotel>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private dataSource: DataSource,
    private configService: ConfigService,
    private filesService: FilesService,
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

  async SearchRoomAvailable(
    searchRoomAvailableDto: SearchRoomAvailableDto,
    hotelId: string,
  ): Promise<any> {
    console.log(searchRoomAvailableDto, hotelId);
    // return { searchRoomAvailableDto, hotelId };
    const rooms = await this.dataSource
      .createQueryBuilder()
      .select('COUNT(booking.id)', 'totalBooking')
      .addSelect('r.*')
      .from(Room, 'r')
      .leftJoin(
        this.subQueryFactoryGetBooking(
          searchRoomAvailableDto.dateFrom,
          searchRoomAvailableDto.dateTo,
        ),
        'booking',
        'r.id = booking.roomId',
      )
      .where(this.searchRoomCondition(searchRoomAvailableDto, hotelId))
      .groupBy('r.id')
      .having('totalBooking < r.total')
      .getRawMany();

    return rooms;
    // create metadata
    // const pageMetaDto = new PageMetaDto({
    //   itemCount,
    //   pageOptionsDto: searchRoomDto,
    // });

    // add data to PageDto
    // return new PageDto(rooms, pageMetaDto);
  }

  async create(
    userId: string,
    hotelId: string,
    images: any,
    createRoomDto: CreateRoomDto,
  ): Promise<Room> {
    const newRoom = this.roomRepository.create({
      ...createRoomDto,
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

    const uploadedImages = images
      ? await this.filesService.uploadFiles(images)
      : [];

    newRoom.hotel = existedHotel;
    newRoom.roomType = existedRoomType;
    newRoom.guestNumber = existedRoomType.guestNumber;
    newRoom.images = uploadedImages;

    return this.roomRepository.save(newRoom);
  }

  async update(
    userId: string,
    roomId: string,
    images: any[],
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

    const uploadedImages = images
      ? await this.filesService.uploadFiles(images)
      : [];

    existedRoom.images = [...existedRoom.images, ...uploadedImages];

    if (updateRoomDto.deleteImages) {
      existedRoom.images = existedRoom.images.filter((image) => {
        if (updateRoomDto.deleteImages.includes(image.key)) {
          this.filesService.deleteFile(image.key);
          return false;
        }
        return true;
      });
    }

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

  public subQueryFactoryGetBooking =
    (dateFrom: string, dateTo: string) => (subQuery) =>
      subQuery
        .select('bk.id', 'id')
        .addSelect('bk.roomId', 'roomId')
        .from(Booking, 'bk')
        .where(
          `((bk.dateFrom <= :dateFrom AND bk.dateTo > :dateFrom) 
              OR (bk.dateFrom < :dateTo AND bk.dateTo >= :dateTo) 
              OR (bk.dateFrom > :dateFrom AND bk.dateTo < :dateTo))`,
          {
            dateFrom,
            dateTo,
          },
        )
        .andWhere('bk.status <> :bookingStatus', {
          bookingStatus: BookingStatus.CANCEL,
        });

  public searchRoomCondition(
    searchRoomDto: SearchRoomDto,
    hotelId: string = null,
  ) {
    return (qb: WhereExpressionBuilder) => {
      qb.andWhere('guestNumber >= :guestNumber', {
        guestNumber: searchRoomDto.guestNumber,
      });

      searchRoomDto.priceFrom &&
        qb.andWhere('price >= :priceFrom', {
          priceFrom: searchRoomDto.priceFrom,
        });

      searchRoomDto.priceTo &&
        qb.andWhere('price <= :priceTo', {
          priceTo: searchRoomDto.priceTo,
        });

      searchRoomDto.areaFrom &&
        qb.andWhere('area >= :areaFrom', {
          areaFrom: searchRoomDto.areaFrom,
        });

      searchRoomDto.areaTo &&
        qb.andWhere('area <= :areaTo', {
          areaTo: searchRoomDto.areaTo,
        });

      searchRoomDto.rate &&
        qb.andWhere('rate >= :rate', {
          rate: searchRoomDto.rate,
        });

      searchRoomDto.roomAmenities &&
        qb.andWhere(
          getQueryInJsonArray(
            'roomAmenities',
            searchRoomDto.roomAmenities,
            this.configService.get<string>('DB_TYPE'),
          ),
        );

      searchRoomDto.name && qb.andWhere(`name LIKE '%${searchRoomDto.name}%'`);

      searchRoomDto.roomTypeId &&
        qb.andWhere('roomTypeId = :roomTypeId', {
          roomTypeId: searchRoomDto.roomTypeId,
        });

      hotelId &&
        qb.andWhere('hotelId = :hotelId', {
          hotelId,
        });
    };
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
      hotel: hotelId && {
        id: hotelId,
      },
      name: searchRoomDto.name && Like(`%${searchRoomDto.name}%`),
      price: between(searchRoomDto.priceFrom, searchRoomDto.priceTo),
      area: between(searchRoomDto.areaFrom, searchRoomDto.areaTo),
      rate: searchRoomDto.rate && MoreThanOrEqual(searchRoomDto.rate),
      roomType: searchRoomDto.roomTypeId && {
        id: searchRoomDto.roomTypeId,
      },
      roomAmenities: findInJsonArray(
        searchRoomDto.roomAmenities,
        this.configService.get<string>('DB_TYPE'),
      ),
      guestNumber:
        searchRoomDto.guestNumber && MoreThanOrEqual(searchRoomDto.guestNumber),
    };

    return {
      where: whereOptions,
    };
  }

  // async findRoomsByHotel(hotelId: string): Promise<Room[]> {
  //   return this.roomRepository.find({ where: { hotel: { id: hotelId } } });
  // }

  // async getSuggestedRooms(userId: string): Promise<Room[]> {
  //   const bookedRoomIds = await this.getBookedRoomIds(userId);

  //   const bookedRooms = await this.roomRepository
  // .createQueryBuilder('room')
  // .whereInIds(bookedRoomIds)
  // .getMany();

  //   const averagePrice = this.calculateAveragePrice(bookedRooms);

  //   const suggestedRooms = await this.roomRepository
  // .createQueryBuilder('room')
  // .where('ABS(room.price - :averagePrice) < :threshold', {
  //   averagePrice: averagePrice,
  //   threshold: averagePrice * 0.1,
  // })
  // .getMany();

  //   return suggestedRooms;
  // }

  // private async getBookedRoomIds(userId: string): Promise<string[]> {
  //   const bookings = await this.bookingRepository.find({
  //     where: { user: { id: userId } },
  //   });

  //   const roomIds = bookings.map((booking) => booking.room.id);

  //   // const roomIds = bookings.map(booking => booking.room);
  //   return roomIds;
  // }

  // private calculateAveragePrice(rooms: Room[]): number {
  //   if (rooms.length === 0) {
  //     return 0;
  //   }

  //   const totalAmount = rooms.reduce((sum, room) => sum + room.price, 0);

  //   const averagePrice = totalAmount / rooms.length;

  //   return averagePrice;
  // }
}
