import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, MaxLength, Min } from 'class-validator';
import { PageOptionsDto } from 'src/common/dtos/page-option.dto';

export class SearchRoomDto extends PageOptionsDto {
  @ApiPropertyOptional()
  @MaxLength(100)
  @IsOptional()
  name: string;

  @ApiPropertyOptional({ minimum: 1 })
  @IsInt()
  @Min(1)
  @IsOptional()
  total: number;

  @ApiPropertyOptional()
  @IsOptional()
  roomTypeId: string;

  @ApiPropertyOptional()
  @IsOptional()
  priceFrom?: number;

  @ApiPropertyOptional({ minimum: 1 })
  @Min(1)
  @IsOptional()
  priceTo?: number;

  @ApiPropertyOptional()
  @IsOptional()
  areaFrom?: number;

  @ApiPropertyOptional({ minimum: 1 })
  @Min(1)
  @IsOptional()
  areaTo?: number;

  @ApiPropertyOptional()
  @IsOptional()
  currentAvailable?: number;

  @ApiPropertyOptional()
  @IsOptional()
  rate?: number;
}
