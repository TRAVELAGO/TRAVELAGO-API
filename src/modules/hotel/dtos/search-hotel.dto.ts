import { DEFAULT_HOTEL_DISTANCE } from '@constants/constants';
import { SearchRoomAvailableDto } from '@modules/room/dtos/search-room-available.dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsNotEmpty } from 'class-validator';

export class SearchHotelDto extends SearchRoomAvailableDto {
  @ApiProperty()
  @Transform(({ value }) => Number(value))
  @IsNotEmpty()
  readonly longitude: number;

  @ApiProperty()
  @Transform(({ value }) => Number(value))
  @IsNotEmpty()
  readonly latitude: number;

  @ApiPropertyOptional({
    default: 40,
  })
  @Transform(({ value }) => Number(value))
  @IsInt()
  readonly maxDistance: number = DEFAULT_HOTEL_DISTANCE;
}
