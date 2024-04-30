import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { HotelDto } from './hotel.dto';
import { IsOptional } from 'class-validator';

export class UpdateHotelDto extends PartialType(HotelDto) {
  @ApiPropertyOptional()
  @IsOptional()
  readonly rate?: number;

  @ApiPropertyOptional()
  @IsOptional()
  readonly deleteImages: string[];
}
