import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsPhoneNumber } from 'class-validator';

export class userInfoDto {
  @ApiProperty({
    default: '0987654321',
  })
  @IsNotEmpty()
  @IsPhoneNumber('VN', {
    message: 'Please enter the correct Vietnamese phone number',
  })
  phoneNumber: string;

  @ApiProperty()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty()
  avatar: string;
}
