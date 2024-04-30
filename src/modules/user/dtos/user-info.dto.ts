import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsPhoneNumber } from 'class-validator';

export class UserInfoDto {
  @ApiPropertyOptional({
    default: '0987654321',
  })
  @IsOptional()
  @IsPhoneNumber('VN', {
    message: 'Please enter the correct Vietnamese phone number',
  })
  readonly phoneNumber: string;

  @ApiPropertyOptional()
  @IsOptional()
  readonly fullName: string;

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
  })
  @IsOptional()
  readonly avatar?: any;
}
