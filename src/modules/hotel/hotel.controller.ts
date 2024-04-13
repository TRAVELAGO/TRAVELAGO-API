import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Put,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { HotelService } from './hotel.services';
import { Hotel } from '@modules/hotel/hotel.entity';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { HotelDto } from './dtos/hotel.dto';
import { RoleType } from '@constants/role-type';
import { Roles } from '@decorators/roles.decorator';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@modules/auth/guards/roles.guard';
import { GetJwtPayload } from '@decorators/get-jwt-payload.decorator';
import { JwtPayloadType } from '@modules/auth/strategies/types/jwt-payload.type';
import { UpdateHotelDto } from './dtos/update-hotel.dto';

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
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles([RoleType.HOTEL])
  async update(
    @GetJwtPayload() user: JwtPayloadType,
    @Param('id') id: string,
    @Body() hotelData: UpdateHotelDto,
  ): Promise<Hotel> {
    return this.hotelService.update(id, user.id, hotelData);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles([RoleType.HOTEL])
  async remove(
    @GetJwtPayload() user: JwtPayloadType,
    @Param('id') id: string,
  ): Promise<void> {
    return this.hotelService.remove(id, user.id);
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles([RoleType.HOTEL])
  async create(
    @GetJwtPayload() user: JwtPayloadType,
    @Body() hotelDto: HotelDto,
  ): Promise<Hotel> {
    return this.hotelService.create(user.id, hotelDto);
  }
}
