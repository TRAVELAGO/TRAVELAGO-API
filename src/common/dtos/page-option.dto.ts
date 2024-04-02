import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';

export class PageOptionsDto {
  @ApiPropertyOptional({ default: 'id,ASC' })
  @IsOptional()
  readonly order?: string;

  @ApiPropertyOptional({
    minimum: 1,
    default: 1,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  readonly pageNumber?: number = 1;

  @ApiPropertyOptional({
    minimum: 1,
    default: 20,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  readonly pageSize?: number = 20;
}
