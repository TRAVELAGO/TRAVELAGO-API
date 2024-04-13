import { ApiProperty } from '@nestjs/swagger';
import { BookingStatus } from '@constants/booking-status';
import { IsEnum } from 'class-validator';

export class UpdateBookingDto {
  @ApiProperty()
  @IsEnum(BookingStatus)
  readonly status: BookingStatus;
}
