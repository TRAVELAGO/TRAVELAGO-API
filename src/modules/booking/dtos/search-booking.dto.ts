import { BookingStatus } from '@constants/booking-status';
import { IsDateFormat } from '@decorators/is-date-format.decorator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsPhoneNumber } from 'class-validator';
import { PageOptionsDto } from 'src/common/dtos/page-option.dto';

export class SearchBookingDto extends PageOptionsDto {
  @ApiPropertyOptional({
    default: '2024-05-14',
  })
  @IsDateFormat()
  @IsOptional()
  readonly dateFrom: string;

  @ApiPropertyOptional({
    default: '2024-05-15',
  })
  @IsDateFormat()
  @IsOptional()
  readonly dateTo: string;

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
