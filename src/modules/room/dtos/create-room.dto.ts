import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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
  name: string;

  @ApiProperty({
    minimum: 1,
    default: 1000000,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  price: number;

  @ApiPropertyOptional({
    default: 150000,
  })
  @IsNumber()
  @IsOptional()
  discount: number;

  @ApiPropertyOptional()
  @IsArray()
  @IsOptional()
  images: string[];

  @ApiProperty({
    minimum: 1,
    default: 3,
  })
  @IsNumber()
  @Min(1)
  total: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description: string;

  @ApiPropertyOptional({
    minimum: 1,
    default: 30,
  })
  @IsNumber()
  @IsOptional()
  @Min(1)
  area: number;

  @ApiPropertyOptional()
  @IsArray()
  @IsOptional()
  roomAmenities: number[];

  @ApiProperty()
  @IsNotEmpty()
  roomTypeId: string;
}
