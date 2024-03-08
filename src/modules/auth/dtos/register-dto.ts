import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class RegisterDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  passWord: string;

  @IsNotEmpty()
  // @IsPhoneNumber()
  phoneNumber: string;

  @IsNotEmpty()
  fullName: string;

  @IsNotEmpty()
  userName: string;

  refreshToken: string;
}
