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
  @ApiProperty()
  @MaxLength(100)
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  price: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  discount: number;

  @ApiPropertyOptional()
  @IsArray()
  @IsOptional()
  images: string[];

  @ApiProperty()
  @IsNumber()
  @Min(1)
  total: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description: string;

  @ApiPropertyOptional()
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

  @ApiProperty()
  @IsNotEmpty()
  hotelId: string;
}
