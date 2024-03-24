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
  readonly bedType1: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  readonly bedType2?: string;

  @ApiProperty({
    minimum: 1,
    default: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  readonly numberBedType1: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  @Min(1)
  readonly numberBedType2?: number;

  @ApiProperty({
    minimum: 1,
    default: 1,
  })
  @IsNumber()
  @Min(1)
  readonly guestNumber: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  readonly description?: string;
}
