import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateRoomDto {
  @ApiProperty({
    maxLength: 100,
  })
  @MaxLength(100)
  @IsNotEmpty()
  readonly name: string;

  @ApiProperty({
    minimum: 1,
    default: 1000000,
  })
  @IsNotEmpty()
  @Type(() => Number) // convert string to number (multipart/form-data)
  @IsNumber()
  @Min(1)
  readonly price: number;

  @ApiPropertyOptional({
    default: 150000,
  })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  readonly discount: number;

  @ApiProperty({
    minimum: 1,
    default: 3,
  })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  readonly total: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  readonly description: string;

  @ApiPropertyOptional({
    minimum: 1,
    default: 30,
  })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  @Min(1)
  readonly area: number;

  @ApiPropertyOptional()
  @IsArray()
  @IsOptional()
  readonly roomAmenities: number[];

  @ApiProperty()
  @IsNotEmpty()
  readonly roomTypeId: string;
}
