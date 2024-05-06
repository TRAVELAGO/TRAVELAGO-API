import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiConsumes, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateRoomDto } from './dtos/create-room.dto';
import { RoomService } from './room.service';
import { UpdateRoomDto } from './dtos/update-room.dto';
import { Room } from './room.entity';
import { JwtPayloadType } from '@modules/auth/strategies/types/jwt-payload.type';
import { SearchRoomDto } from './dtos/search-room.dto';
import { RoleType } from '@constants/role-type';
import { GetJwtPayload } from '@decorators/get-jwt-payload.decorator';
import { Roles } from '@decorators/roles.decorator';
import { PageDto } from 'src/common/dtos/page.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { imageFilter } from 'src/utils/multer-file-filter';
import { ActiveHotelGuard } from '@modules/auth/guards/active-hotel.guard';

@ApiTags('Rooms')
@Controller()
export class RoomController {
  constructor(private roomService: RoomService) {}

  @Get('rooms/:id')
  @ApiResponse({ status: 200, description: 'Successfully.' })
  @ApiResponse({ status: 404, description: 'Room not found.' })
  async find(@Param('id') roomId: string): Promise<Room> {
    return this.roomService.find(roomId);
  }

  @Get('rooms')
  @ApiResponse({ status: 200, description: 'Successfully.' })
  async search(@Query() searchRoomDto: SearchRoomDto): Promise<PageDto<Room>> {
    return this.roomService.search(searchRoomDto);
  }

  @Get('hotels/:hotelId/rooms')
  @ApiResponse({ status: 200, description: 'Successfully.' })
  async searchHotelRoom(
    @Param('hotelId') hotelId: string,
    @Query() searchRoomDto: SearchRoomDto,
  ): Promise<PageDto<Room>> {
    return this.roomService.search(searchRoomDto, hotelId);
  }

  @Post('hotels/:hotelId/rooms')
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'Create room successfully.' })
  @ApiResponse({ status: 400, description: 'Validation failure.' })
  @Roles(RoleType.HOTEL)
  @UseGuards(ActiveHotelGuard)
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'images' }], { fileFilter: imageFilter }),
  )
  async create(
    @GetJwtPayload() user: JwtPayloadType,
    @Param('hotelId') hotelId: string,
    @UploadedFiles()
    files: {
      images?: any;
    },
    @Body() createRoomDto: CreateRoomDto,
  ): Promise<Room> {
    return this.roomService.create(
      user.id,
      hotelId,
      files.images,
      createRoomDto,
    );
  }

  @Patch('rooms/:id')
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 200, description: 'Update room successfully.' })
  @ApiResponse({ status: 400, description: 'Validation failure.' })
  @ApiResponse({ status: 404, description: 'Room does not exist.' })
  @ApiResponse({ status: 404, description: 'Room Type does not exist.' })
  @Roles(RoleType.HOTEL)
  @UseGuards(ActiveHotelGuard)
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'images' }], { fileFilter: imageFilter }),
  )
  async update(
    @GetJwtPayload() user: JwtPayloadType,
    @Param('id') roomId: string,
    @UploadedFiles()
    files: {
      images?: any[];
    },
    @Body() updateRoomDto: UpdateRoomDto,
  ): Promise<Room> {
    return this.roomService.update(
      user.id,
      roomId,
      files?.images,
      updateRoomDto,
    );
  }

  @Delete('rooms/:id')
  @ApiResponse({ status: 204, description: 'Delete room successfully.' })
  @ApiResponse({ status: 404, description: 'Room not found.' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(RoleType.HOTEL)
  @UseGuards(ActiveHotelGuard)
  async delete(
    @GetJwtPayload() user: JwtPayloadType,
    @Param('id') roomId: string,
  ): Promise<void> {
    return this.roomService.delete(user.id, roomId);
  }

  // @Get('/hotel/:hotelId')
  // async findByHotel(@Param('hotelId') hotelId: string): Promise<Room[]> {
  //   return this.roomService.findRoomsByHotel(hotelId);
  // }

  // @Get(':userId/getSuggestedRooms')
  // async getSuggestedRooms(@Param('userId') userId: string) {
  //   const rooms = await this.roomService.getSuggestedRooms(userId);
  //   return rooms;
  // }
}
