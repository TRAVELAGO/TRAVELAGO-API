import { ApiPropertyOptional, PartialType, OmitType } from '@nestjs/swagger';
import { CreateRoomDto } from './create-room.dto';
import { IsNumber, IsOptional } from 'class-validator';

export class SearchRoomDto extends PartialType(
  OmitType(CreateRoomDto, [
    'description',
    'images',
    'price',
    'discount',
    'area',
    'roomAmenities',
  ]),
) {
  @ApiPropertyOptional({ name: 'page-size' })
  @IsNumber()
  @IsOptional()
  pageSize?: number;

  @ApiPropertyOptional({ name: 'page-number' })
  @IsNumber()
  @IsOptional()
  pageNumber?: number;

  @ApiPropertyOptional()
  @IsOptional()
  priceFrom?: number;

  @ApiPropertyOptional()
  @IsOptional()
  priceTo?: number;

  @ApiPropertyOptional()
  @IsOptional()
  areaFrom?: number;

  @ApiPropertyOptional()
  @IsOptional()
  areaTo?: number;

  @ApiPropertyOptional()
  @IsOptional()
  currentAvailable?: number;

  @ApiPropertyOptional()
  @IsOptional()
  rate?: number;
}
