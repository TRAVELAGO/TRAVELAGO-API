import { ConfigService } from '@nestjs/config';
import { SearchHotelDto } from './dtos/search-hotel.dto';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Hotel } from '@modules/hotel/hotel.entity';
import { HotelDto } from './dtos/hotel.dto';
import { HotelStatus } from '@constants/hotel-status';
import { UpdateHotelDto } from './dtos/update-hotel.dto';
import { FilesService } from '@modules/files/files.service';
import { Room } from '@modules/room/room.entity';
import { getFileObjects } from 'src/utils/files';
import { addOrderQuery, addPaginationQuery } from 'src/utils/pagination';
import { RoomService } from '@modules/room/room.service';

@Injectable()
export class HotelService {
  constructor(
    @InjectRepository(Hotel) private hotelRepository: Repository<Hotel>,
    private dataSource: DataSource,
    private filesService: FilesService,
    private roomService: RoomService,
    private configService: ConfigService,
  ) {}

  async findHotelByUserId(userId: string): Promise<Hotel[]> {
    return this.hotelRepository
      .createQueryBuilder('h')
      .where('userId = :userId', { userId })
      .getMany();
  }

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
    images: any[],
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

    const uploadedImages = images
      ? await this.filesService.uploadFiles(images)
      : [];

    this.hotelRepository.merge(existedHotel, updateHotelDto);

    existedHotel.images = [...existedHotel.images, ...uploadedImages];

    if (updateHotelDto.deleteImages) {
      existedHotel.images = existedHotel.images.filter((image) => {
        if (updateHotelDto.deleteImages.includes(image.key)) {
          this.filesService.deleteFile(image.key);
          return false;
        }
        return true;
      });
    }

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

  async searchNearestHotel(searchHotelDto: SearchHotelDto): Promise<any> {
    const query = this.dataSource
      .createQueryBuilder()
      .select('MIN(RoomAvailable.price)', 'minRoomPrice')
      .addSelect('nearestHotel.*')
      .from(
        this.subQueryFactoryNearestHotel(
          searchHotelDto.longitude,
          searchHotelDto.latitude,
          searchHotelDto.maxDistance,
        ),
        'nearestHotel',
      )
      .innerJoin(
        (subQuery) => {
          return subQuery
            .select('COUNT(b.id)', 'totalBooking')
            .addSelect('r.id', 'roomId')
            .addSelect('r.total', 'total')
            .addSelect('r.price', 'price')
            .addSelect('r.hotelId', 'hotelId')
            .from(Room, 'r')
            .leftJoin(
              this.roomService.subQueryFactoryGetBooking(
                searchHotelDto.dateFrom,
                searchHotelDto.dateTo,
              ),
              'b',
              'r.id = b.roomId',
            )
            .where(this.roomService.searchRoomCondition(searchHotelDto))
            .groupBy('r.id')
            .having(
              `${this.configService.get('DB_TYPE') === 'mysql' ? 'totalBooking' : 'COUNT(b.id)'} < r.total`,
            );
        },
        'roomAvailable',
        'roomAvailable.hotelId = nearestHotel.id',
      )
      .groupBy('nearestHotel.id');

    addOrderQuery(query, searchHotelDto.order, [
      'id',
      'rate',
      'distance',
      'minRoomPrice',
    ]);

    addPaginationQuery(
      query,
      searchHotelDto.pageNumber,
      searchHotelDto.pageSize,
    );

    const nearestHotels = await query.getRawMany();

    nearestHotels.forEach((nearestHotel) => {
      nearestHotel.images = getFileObjects(nearestHotel.images);
    });

    return nearestHotels;
  }

  async findHotelsByCity(cityId: string): Promise<Hotel[]> {
    return this.hotelRepository.find({ where: { city: { id: cityId } } });
  }

  private subQueryFactoryNearestHotel =
    (longitude, latitude, maxDistance) => (subQuery) => {
      subQuery
        .select('h.*')
        .addSelect(
          this.configService.get('DB_TYPE') === 'mysql'
            ? 'ST_Distance_Sphere(POINT(:longitude, :latitude), POINT(longitude, latitude)) * 0.001'
            : 'SQRT(POW(69.1 * (latitude::numeric - :latitude), 2) + POW(69.1 * (:longitude - longitude::numeric) * COS(latitude::numeric / 57.3), 2)) * 1.60934',
          'distance',
        )
        .from(Hotel, 'h')
        .where('h.status = :hotelStatus', { hotelStatus: HotelStatus.OPEN });

      this.configService.get('DB_TYPE') === 'mysql' &&
        subQuery.having('distance <= :maxDistance');

      this.configService.get('DB_TYPE') === 'postgres' &&
        subQuery.andWhere(
          'SQRT(POW(69.1 * (latitude::numeric - :latitude), 2) + POW(69.1 * (:longitude - longitude::numeric) * COS(latitude::numeric / 57.3), 2)) * 1.60934  <= :maxDistance',
        );

      return subQuery
        .setParameter('longitude', longitude)
        .setParameter('latitude', latitude)
        .setParameter('maxDistance', maxDistance);
    };
}
