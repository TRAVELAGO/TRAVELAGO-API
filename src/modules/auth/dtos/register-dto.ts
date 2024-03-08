import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class RegisterDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  password: string;

  @IsNotEmpty()
  // @IsPhoneNumber()
  phoneNumber: string;

  @IsNotEmpty()
  fullName: string;

  @IsNotEmpty()
  username: string;

  refreshToken: string;
}
