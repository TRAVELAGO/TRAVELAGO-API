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
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateRoomDto } from './dtos/create-room.dto';
import { RoomService } from './room.service';
import { UpdateRoomDto } from './dtos/update-room.dto';
import { Room } from './room.entity';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { GetJwtPayload } from 'src/decorators/get-jwt-payload.decorator';
import { JwtPayloadType } from '@modules/auth/strategies/types/jwt-payload.type';
import { RolesGuard } from '@modules/auth/guards/roles.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { RoleType } from '@constants/role-type';
import { SearchRoomDto } from './dtos/seach-room.dto';

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
  @ApiQuery({ name: 'page-number', required: false, type: Number })
  @ApiQuery({ name: 'page-size', required: false, type: Number })
  async search(@Query() searchRoomDto: SearchRoomDto): Promise<Room[]> {
    return this.roomService.search(searchRoomDto);
  }

  @Get('hotels/:hotelId/rooms')
  @ApiResponse({ status: 200, description: 'Successfully.' })
  async searchHotelRoom(
    @Param('hotelId') hotelId: string,
    @Query() searchRoomDto: SearchRoomDto,
  ): Promise<Room[]> {
    return this.roomService.search(searchRoomDto, hotelId);
  }

  @Post('hotels/:hotelId/rooms')
  @ApiResponse({ status: 201, description: 'Create room successfully.' })
  @ApiResponse({ status: 400, description: 'Validation failure.' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles([RoleType.HOTEL])
  async create(
    @GetJwtPayload() user: JwtPayloadType,
    @Param('hotelId') hotelId: string,
    @Body() createRoomDto: CreateRoomDto,
  ): Promise<any> {
    return this.roomService.create(user.id, hotelId, createRoomDto);
  }

  @Patch('rooms/:id')
  @ApiResponse({ status: 200, description: 'Update room successfully.' })
  @ApiResponse({ status: 400, description: 'Validation failure.' })
  @ApiResponse({ status: 404, description: 'Room does not exist.' })
  @ApiResponse({ status: 404, description: 'Room Type does not exist.' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles([RoleType.HOTEL])
  async update(
    @GetJwtPayload() user: JwtPayloadType,
    @Param('id') roomId: string,
    @Body() updateRoomDto: UpdateRoomDto,
  ): Promise<Room> {
    return this.roomService.update(user.id, roomId, updateRoomDto);
  }

  @Delete('rooms/:id')
  @ApiResponse({ status: 204, description: 'Delete room successfully.' })
  @ApiResponse({ status: 404, description: 'Room not found.' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles([RoleType.HOTEL])
  async delete(
    @GetJwtPayload() user: JwtPayloadType,
    @Param('id') roomId: string,
  ): Promise<void> {
    return this.roomService.delete(user.id, roomId);
  }
}
