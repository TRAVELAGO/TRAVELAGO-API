import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, MaxLength, Min } from 'class-validator';
import { PageOptionsDto } from 'src/common/dtos/page-option.dto';

export class SearchRoomDto extends PageOptionsDto {
  @ApiPropertyOptional()
  @MaxLength(100)
  @IsOptional()
  readonly name: string;

  @ApiPropertyOptional({ minimum: 1 })
  @IsInt()
  @Min(1)
  @IsOptional()
  readonly total: number;

  @ApiPropertyOptional()
  @IsOptional()
  readonly roomTypeId: string;

  @ApiPropertyOptional()
  @IsOptional()
  readonly priceFrom?: number;

  @ApiPropertyOptional({ minimum: 1 })
  @Min(1)
  @IsOptional()
  readonly priceTo?: number;

  @ApiPropertyOptional()
  @IsOptional()
  readonly areaFrom?: number;

  @ApiPropertyOptional({ minimum: 1 })
  @Min(1)
  @IsOptional()
  readonly areaTo?: number;

  @ApiPropertyOptional()
  @IsOptional()
  readonly currentAvailable?: number;

  @ApiPropertyOptional()
  @IsOptional()
  readonly rate?: number;

  @ApiPropertyOptional({ default: 'amenityId1,amenityId2' })
  @IsOptional()
  readonly roomAmenities?: string;
}
