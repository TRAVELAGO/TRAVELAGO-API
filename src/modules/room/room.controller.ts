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

@ApiTags('Room')
@Controller('room')
export class RoomController {
  constructor(private roomService: RoomService) {}

  @Get(':id')
  @ApiResponse({ status: 200, description: 'Successfully.' })
  @ApiResponse({ status: 404, description: 'Room not found.' })
  async find(@Param('id') roomId: string): Promise<Room> {
    return this.roomService.find(roomId);
  }

  @Get()
  @ApiResponse({ status: 200, description: 'Successfully.' })
  @ApiQuery({ name: 'page-number', required: false, type: Number })
  @ApiQuery({ name: 'page-size', required: false, type: Number })
  async findAll(
    @Query('page-number') pageNumber?: number,
    @Query('page-size') pageSize?: number,
  ): Promise<Room[]> {
    return this.roomService.findAll(pageNumber, pageSize);
  }

  @Post()
  @ApiResponse({ status: 201, description: 'Create room successfully.' })
  @ApiResponse({ status: 400, description: 'Validation failure.' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles([RoleType.HOTEL])
  async create(
    @GetJwtPayload() user: JwtPayloadType,
    @Body() createRoomDto: CreateRoomDto,
  ): Promise<any> {
    return this.roomService.create(user.id, createRoomDto);
  }

  @Patch(':id')
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
  ): Promise<void> {
    return this.roomService.update(user.id, roomId, updateRoomDto);
  }

  @Delete(':id')
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
