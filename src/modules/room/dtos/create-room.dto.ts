import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
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
    minimum: 5000,
    default: 1000000,
  })
  @IsNotEmpty()
  @Type(() => Number) // convert string to number (multipart/form-data)
  @IsNumber()
  @Min(5000)
  readonly price: number;

  @ApiPropertyOptional({
    minimum: 0,
    default: 0,
  })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  @Min(0)
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
  @Transform(({ value }) => value && value.split(','))
  @IsArray()
  @IsOptional()
  readonly roomAmenities: string[] = [];

  @ApiProperty()
  @IsNotEmpty()
  readonly roomTypeId: string;
}
