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
import { ApiConsumes, ApiTags } from '@nestjs/swagger';
import { HotelDto } from './dtos/hotel.dto';
import { GetJwtPayload } from '@decorators/get-jwt-payload.decorator';
import { JwtPayloadType } from '@modules/auth/strategies/types/jwt-payload.type';
import { UpdateHotelDto } from './dtos/update-hotel.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { imageFilter } from 'src/utils/multer-file-filter';
import { ActiveHotel } from '@decorators/active-hotel.decorator';

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
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'images' }], { fileFilter: imageFilter }),
  )
  @ActiveHotel()
  async update(
    @GetJwtPayload() user: JwtPayloadType,
    @Param('id') id: string,
    @UploadedFiles()
    files: {
      images?: any;
    },
    @Body() hotelData: UpdateHotelDto,
  ): Promise<Hotel> {
    return this.hotelService.update(id, user.id, files?.images, hotelData);
  }

  @Delete(':id')
  @ActiveHotel()
  async remove(
    @GetJwtPayload() user: JwtPayloadType,
    @Param('id') id: string,
  ): Promise<void> {
    return this.hotelService.remove(id, user.id);
  }

  @Post()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'images' }], { fileFilter: imageFilter }),
  )
  @ActiveHotel()
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
