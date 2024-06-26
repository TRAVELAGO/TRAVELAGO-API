import { HotelStatus } from '@constants/hotel-status';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsOptional, Matches } from 'class-validator';
import { timeRegex } from 'src/utils/date';

export class HotelDto {
  @ApiProperty()
  @IsNotEmpty()
  readonly name: string;

  @ApiProperty()
  @IsNotEmpty()
  readonly address: string;

  @ApiPropertyOptional()
  @IsOptional()
  readonly description: string;

  @ApiPropertyOptional({ default: HotelStatus.OPEN })
  @Transform(({ value }) => Number(value))
  @IsEnum(HotelStatus)
  @IsOptional()
  readonly status: HotelStatus;

  @ApiProperty({
    default: '14:00:00',
  })
  @Matches(timeRegex, {
    message:
      'Invalid time format. Check in time should be in the format HH:mm:ss.',
  })
  @IsNotEmpty()
  readonly checkInTime: string;

  @ApiProperty({
    default: '12:00:00',
  })
  @Matches(timeRegex, {
    message:
      'Invalid time format. Check out time should be in the format HH:mm:ss.',
  })
  @IsNotEmpty()
  readonly checkOutTime: string;

  @ApiPropertyOptional()
  @IsOptional()
  readonly longitude: string;

  @ApiPropertyOptional()
  @IsOptional()
  readonly latitude: string;

  @ApiPropertyOptional({
    type: 'array',
    items: {
      type: 'string',
      format: 'binary',
    },
  })
  @IsOptional()
  images?: any[];
}
