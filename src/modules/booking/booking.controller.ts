import {
  Body,
  Controller,
  Get,
  Ip,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateBookingDto } from './dtos/create-booking.dto';
import { BookingService } from './booking.service';
import { UpdateBookingDto } from './dtos/update-booking.dto';
import { Booking } from './booking.entity';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { JwtPayloadType } from '@modules/auth/strategies/types/jwt-payload.type';
import { RoleType } from '@constants/role-type';
import { GetJwtPayload } from '@decorators/get-jwt-payload.decorator';
import { Roles } from '@decorators/roles.decorator';
import { BookingStatus } from '@constants/booking-status';
import { PageDto } from 'src/common/dtos/page.dto';
import { SearchBookingDto } from './dtos/search-booking.dto';

@ApiTags('Bookings')
@Controller('bookings')
export class BookingController {
  constructor(private bookingService: BookingService) {}

  @Get(':id')
  @ApiResponse({ status: 200, description: 'Successfully.' })
  @ApiResponse({ status: 404, description: 'Booking not found.' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async find(
    @GetJwtPayload() user: JwtPayloadType,
    @Param('id') bookingId: string,
  ): Promise<Booking> {
    return this.bookingService.find(user, bookingId);
  }

  @Get()
  @ApiResponse({ status: 200, description: 'Successfully.' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async search(
    @GetJwtPayload() user: JwtPayloadType,
    @Query() searchBookingDto: SearchBookingDto,
  ): Promise<PageDto<Booking>> {
    return this.bookingService.search(user, searchBookingDto);
  }

  @Post('online')
  @ApiResponse({ status: 201, description: 'Create booking successfully.' })
  @ApiResponse({ status: 400, description: 'Validation failure.' })
  @ApiResponse({ status: 409, description: 'Conflict booking time.' })
  @Roles(RoleType.USER)
  async bookingOnline(
    @GetJwtPayload() user: JwtPayloadType,
    @Ip() ip,
    @Body() createBookingDto: CreateBookingDto,
  ): Promise<Booking> {
    return this.bookingService.createBookingOnline(user, createBookingDto, ip);
  }

  @Post('directly')
  @ApiResponse({ status: 201, description: 'Create booking successfully.' })
  @ApiResponse({ status: 400, description: 'Validation failure.' })
  @ApiResponse({ status: 409, description: 'Conflict booking time.' })
  @Roles(RoleType.HOTEL)
  async bookingDirectly(
    @GetJwtPayload() user: JwtPayloadType,
    @Body() createBookingDto: CreateBookingDto,
  ): Promise<Booking> {
    return this.bookingService.createBookingDirectly(user, createBookingDto);
  }

  @Patch(':id/check-in')
  @ApiResponse({ status: 200, description: 'Update booking successfully.' })
  @ApiResponse({ status: 404, description: 'Booking does not exist.' })
  @ApiResponse({ status: 403 })
  @Roles(RoleType.HOTEL)
  async checkIn(
    @GetJwtPayload() user: JwtPayloadType,
    @Param('id') bookingId: string,
  ): Promise<Booking> {
    return this.bookingService.updateStatus(
      user,
      bookingId,
      BookingStatus.CHECK_IN,
    );
  }

  @Patch(':id/cancel')
  @ApiResponse({ status: 200, description: 'Update booking successfully.' })
  @ApiResponse({ status: 404, description: 'Booking does not exist.' })
  @ApiResponse({ status: 403 })
  @Roles(RoleType.USER, RoleType.HOTEL)
  async cancelBooking(
    @GetJwtPayload() user: JwtPayloadType,
    @Param('id') bookingId: string,
  ): Promise<Booking> {
    // Upgrade: check time and refund payment with booking online
    return this.bookingService.updateStatus(
      user,
      bookingId,
      BookingStatus.CANCEL,
    );
  }

  @Patch(':id')
  @ApiResponse({ status: 200, description: 'Update booking successfully.' })
  @ApiResponse({ status: 400, description: 'Validation failure.' })
  @ApiResponse({ status: 404, description: 'Booking does not exist.' })
  @Roles(RoleType.USER)
  async update(
    @GetJwtPayload() user: JwtPayloadType,
    @Param('id') bookingId: string,
    @Body() updateBookingDto: UpdateBookingDto,
  ): Promise<Booking> {
    return this.bookingService.update(user, bookingId, updateBookingDto);
  }
}
