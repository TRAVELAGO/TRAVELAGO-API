import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsPhoneNumber } from 'class-validator';

export class changePasswordDto {
  @ApiProperty()
  @IsNotEmpty()
  oldPassword: string;

  @ApiProperty()
  @ApiProperty()
  newPassword: string;

  @ApiProperty()
  @ApiProperty()
  confirmPassword: string;
}
