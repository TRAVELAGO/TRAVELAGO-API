import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsDate, IsNotEmpty } from 'class-validator';

export class CreateBookingDto {
  @ApiProperty({
    default: '2024-04-14',
  })
  @Transform(({ value }) => new Date(value))
  @IsDate()
  readonly dateFrom: Date;

  @ApiProperty({
    default: '2024-04-15',
  })
  @Transform(({ value }) => new Date(value))
  @IsDate()
  readonly dateTo: Date;

  @ApiProperty()
  @IsNotEmpty()
  readonly roomId: string;
}
