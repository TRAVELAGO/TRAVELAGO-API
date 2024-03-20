import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateRoomTypeDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  bedType1: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  bedType2?: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  numberBedType1: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  @Min(1)
  numberBedType2?: number;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  guestNumber: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;
}
