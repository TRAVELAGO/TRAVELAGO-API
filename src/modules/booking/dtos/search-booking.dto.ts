import { BookingStatus } from '@constants/booking-status';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsDate,
  IsEmail,
  IsEnum,
  IsOptional,
  IsPhoneNumber,
} from 'class-validator';
import { PageOptionsDto } from 'src/common/dtos/page-option.dto';

export class SearchBookingDto extends PageOptionsDto {
  @ApiPropertyOptional()
  @Transform(({ value }) => new Date(value))
  @IsDate()
  @IsOptional()
  readonly dateFrom?: Date;

  @ApiPropertyOptional()
  @Transform(({ value }) => new Date(value))
  @IsDate()
  @IsOptional()
  readonly dateTo?: Date;

  @ApiPropertyOptional()
  @IsEnum(BookingStatus)
  @IsOptional()
  readonly status?: BookingStatus;

  @ApiPropertyOptional()
  @IsOptional()
  readonly roomId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsPhoneNumber('VN', {
    message: 'Please enter the correct Vietnamese phone number',
  })
  readonly userPhone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  readonly userEmail?: string;
}
