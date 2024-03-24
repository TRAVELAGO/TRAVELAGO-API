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
  readonly name: string;

  @ApiProperty({
    minimum: 1,
    default: 1000000,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  readonly price: number;

  @ApiPropertyOptional({
    default: 150000,
  })
  @IsNumber()
  @IsOptional()
  readonly discount: number;

  @ApiPropertyOptional()
  @IsArray()
  @IsOptional()
  readonly images: string[];

  @ApiProperty({
    minimum: 1,
    default: 3,
  })
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
