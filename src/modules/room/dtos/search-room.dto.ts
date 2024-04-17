import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsOptional, Max, MaxLength, Min } from 'class-validator';
import { PageOptionsDto } from 'src/common/dtos/page-option.dto';

export class SearchRoomDto extends PageOptionsDto {
  @ApiPropertyOptional()
  @MaxLength(100)
  @IsOptional()
  readonly name?: string;

  @ApiPropertyOptional({ minimum: 1 })
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  @IsOptional()
  readonly total?: number;

  @ApiPropertyOptional()
  @IsOptional()
  readonly roomTypeId?: string;

  @ApiPropertyOptional({ minimum: 0 })
  @Transform(({ value }) => Number(value))
  @Min(0)
  @IsOptional()
  readonly priceFrom?: number;

  @ApiPropertyOptional({ minimum: 1 })
  @Transform(({ value }) => Number(value))
  @Min(1)
  @IsOptional()
  readonly priceTo?: number;

  @ApiPropertyOptional({ minimum: 0 })
  @Transform(({ value }) => Number(value))
  @Min(0)
  @IsOptional()
  readonly areaFrom?: number;

  @ApiPropertyOptional({ minimum: 1 })
  @Transform(({ value }) => Number(value))
  @Min(1)
  @IsOptional()
  readonly areaTo?: number;

  @ApiPropertyOptional({ maximum: 5 })
  @Transform(({ value }) => Number(value))
  @Max(5)
  @IsOptional()
  readonly rate?: number;

  @ApiPropertyOptional({ default: 'amenityId1,amenityId2' })
  @IsOptional()
  readonly roomAmenities?: string;
}
