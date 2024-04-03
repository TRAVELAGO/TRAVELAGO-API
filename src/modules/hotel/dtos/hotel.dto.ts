import { HotelStatus } from '@constants/hotel-status';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsEnum, IsNotEmpty, IsOptional } from 'class-validator';

export class HotelDto {
  @ApiProperty()
  @IsNotEmpty()
  readonly name: string;

  @ApiPropertyOptional()
  @IsNotEmpty()
  readonly address: string;

  @ApiPropertyOptional()
  @IsArray()
  @IsOptional()
  readonly images: string[];

  @ApiPropertyOptional()
  @IsOptional()
  readonly description: string;

  @ApiPropertyOptional({ default: HotelStatus.OPEN })
  @IsEnum(HotelStatus)
  @IsOptional()
  readonly status: HotelStatus;

  @ApiPropertyOptional()
  @IsOptional()
  readonly longitude: string;

  @ApiPropertyOptional()
  @IsOptional()
  readonly latitude: string;
}
