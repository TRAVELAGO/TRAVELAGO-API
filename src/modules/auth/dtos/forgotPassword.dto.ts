import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class forgotPasswordDto {

  @ApiProperty()
  @IsNotEmpty()
  password: string;

  @IsNotEmpty()
  passwordToken: string;

  @ApiProperty()
  @IsNotEmpty()
  passwordComfirm: string;
}