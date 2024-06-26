import { IsDateFormat } from '@decorators/is-date-format.decorator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateBookingDto {
  @ApiProperty({
    default: '2024-05-14',
  })
  @IsDateFormat()
  @IsNotEmpty()
  readonly dateFrom: string;

  @ApiProperty({
    default: '2024-05-15',
  })
  @IsDateFormat()
  @IsNotEmpty()
  readonly dateTo: string;

  @ApiProperty()
  @IsNotEmpty()
  readonly roomId: string;

  @ApiPropertyOptional()
  @IsOptional()
  readonly voucherId?: string;
}
