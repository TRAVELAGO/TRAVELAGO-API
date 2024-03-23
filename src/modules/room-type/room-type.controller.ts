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
  UseGuards,
} from '@nestjs/common';
import { ApiResponse, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { RoomTypeService } from './room-type.service';
import { CreateRoomTypeDto } from './dto/create-room-type.dto';
import { UpdateRoomTypeDto } from './dto/update-room-type.dto';
import { RoomType } from './room-type.entity';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';

@ApiTags('Room Types')
@Controller('room-types')
export class RoomTypeController {
  constructor(private roomTypeService: RoomTypeService) {}

  @Get(':id')
  @ApiResponse({ status: 200, description: 'Successfully.' })
  @ApiResponse({ status: 404, description: 'Room type not found.' })
  async find(@Param('id') roomTypeId: string): Promise<RoomType> {
    return this.roomTypeService.find(roomTypeId);
  }

  @Get()
  @ApiResponse({ status: 200, description: 'Successfully.' })
  async findAll(): Promise<RoomType[]> {
    return this.roomTypeService.findAll();
  }

  @Post()
  @ApiResponse({ status: 201, description: 'Create room type successfully.' })
  @ApiResponse({ status: 400, description: 'Validation failure.' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async create(
    @Body() createRoomTypeDto: CreateRoomTypeDto,
  ): Promise<RoomType> {
    return this.roomTypeService.create(createRoomTypeDto);
  }

  @Patch(':id')
  @ApiResponse({ status: 200, description: 'Update room type successfully.' })
  @ApiResponse({ status: 400, description: 'Validation failure.' })
  @ApiResponse({ status: 404, description: 'Room type not found.' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') roomTypeId: string,
    @Body() updateRoomTypeDto: UpdateRoomTypeDto,
  ): Promise<RoomType> {
    return this.roomTypeService.update(roomTypeId, updateRoomTypeDto);
  }

  @Delete(':id')
  @ApiResponse({ status: 204, description: 'Delete room type successfully.' })
  @ApiResponse({ status: 404, description: 'Room type not found.' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') roomTypeId: string): Promise<void> {
    return await this.roomTypeService.delete(roomTypeId);
  }
}
