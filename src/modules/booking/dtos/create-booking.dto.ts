import { VN_TIME_ZONE } from '@constants/constants';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsDate, IsNotEmpty, IsOptional } from 'class-validator';
import { fromZonedTime } from 'date-fns-tz';

export class CreateBookingDto {
  @ApiProperty({
    default: '2024-05-14',
  })
  @Transform(({ value }) => fromZonedTime(new Date(value), VN_TIME_ZONE))
  @IsDate()
  readonly dateFrom: Date;

  @ApiProperty({
    default: '2024-05-15',
  })
  @Transform(({ value }) => fromZonedTime(new Date(value), VN_TIME_ZONE))
  @IsDate()
  readonly dateTo: Date;

  @ApiProperty()
  @IsNotEmpty()
  readonly roomId: string;

  @ApiPropertyOptional()
  @IsOptional()
  readonly voucherId?: string;
}
