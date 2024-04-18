import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateVoucherDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  readonly name: string;

  @ApiPropertyOptional({
    minimum: 0,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  readonly minimumAmount?: number;

  @ApiPropertyOptional({
    minimum: 0,
    maximum: 100,
    default: 20,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  readonly discountPercentage?: number;

  @ApiProperty({
    minimum: 0,
    default: 10000,
  })
  @IsNumber()
  @Min(0)
  readonly maximumDiscount: number;

  @ApiProperty({
    minimum: 100,
  })
  @IsNumber()
  @Min(1)
  readonly quantity: number;

  @ApiProperty()
  @Transform(({ value }) => new Date(value))
  @IsDate()
  readonly expiredDate: Date;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  readonly description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  readonly hotelId?: string;
}
