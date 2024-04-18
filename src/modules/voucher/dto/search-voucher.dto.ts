import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class SearchVoucherDto {
  @ApiPropertyOptional()
  @IsOptional()
  readonly hotelId?: string;
}
