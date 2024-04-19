import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Put,
  Delete,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { HotelService } from './hotel.services';
import { Hotel } from '@modules/hotel/hotel.entity';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { HotelDto } from './dtos/hotel.dto';
import { RoleType } from '@constants/role-type';
import { Roles } from '@decorators/roles.decorator';
import { GetJwtPayload } from '@decorators/get-jwt-payload.decorator';
import { JwtPayloadType } from '@modules/auth/strategies/types/jwt-payload.type';
import { UpdateHotelDto } from './dtos/update-hotel.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { imageFilter } from '@configs/multer-file-filter';
import { HotelStatus } from '@constants/hotel-status';

@ApiTags('Hotel')
@Controller('hotels')
export class HotelController {
  constructor(private hotelService: HotelService) {}

  @Get()
  async findAll(): Promise<Hotel[]> {
    return this.hotelService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Hotel> {
    return this.hotelService.findOne(id);
  }

  @Put(':id')
  @Roles(RoleType.HOTEL)
  async update(
    @GetJwtPayload() user: JwtPayloadType,
    @Param('id') id: string,
    @Body() hotelData: UpdateHotelDto,
  ): Promise<Hotel> {
    return this.hotelService.update(id, user.id, hotelData);
  }

  @Delete(':id')
  @Roles(RoleType.HOTEL)
  async remove(
    @GetJwtPayload() user: JwtPayloadType,
    @Param('id') id: string,
  ): Promise<void> {
    return this.hotelService.remove(id, user.id);
  }

  @Post()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        address: { type: 'string' },
        description: { type: 'string' },
        status: { type: 'number', default: HotelStatus.OPEN },
        checkInTime: { type: 'string', default: '14:00:00' },
        checkOutTime: { type: 'string', default: '12:00:00' },
        longitude: { type: 'string' },
        latitude: { type: 'string' },
        images: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
      required: ['name', 'address', 'checkInTime', 'checkOutTime'],
    },
  })
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'images' }], { fileFilter: imageFilter }),
  )
  @Roles(RoleType.HOTEL)
  async create(
    @GetJwtPayload() user: JwtPayloadType,
    @UploadedFiles()
    files: {
      images?: any;
    },
    @Body() hotelDto: HotelDto,
  ): Promise<Hotel> {
    return this.hotelService.create(user.id, files.images, hotelDto);
  }

  @Get('/search/:cityId')
  async findByCity(@Param('cityId') cityId: string): Promise<Hotel[]> {
    return this.hotelService.findHotelsByCity(cityId);
  }
}
