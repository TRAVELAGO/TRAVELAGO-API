import { HotelStatus } from '@constants/hotel-status';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class HotelDto {
  @ApiProperty()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  address: string;

  @ApiProperty()
  @IsNotEmpty()
  description: string;

  @ApiProperty()
  @IsNotEmpty()
  status: HotelStatus;
}
