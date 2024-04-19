import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class fogetPasswordDto {
  @ApiProperty({
    default: 'test@gmail.com',
  })
  @IsNotEmpty()
  @IsEmail()
  readonly email: string;
}
