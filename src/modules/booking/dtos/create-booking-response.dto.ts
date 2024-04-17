import { Booking } from '../booking.entity';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBookingResponseDto {
  @ApiProperty()
  readonly paymentUrl: string;

  @ApiProperty()
  readonly booking: Booking;

  constructor(booking: Booking, paymentUrl: string) {
    this.booking = booking;
    this.paymentUrl = paymentUrl;
  }
}
