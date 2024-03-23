import { RoleType } from '@constants/role-type';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Match } from 'src/decorators/match-password.decorator';

export class RegisterDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  @MinLength(6)
  @MaxLength(20)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'Password too weak!',
  })
  password: string;

  @ApiProperty()
  @IsString()
  @MinLength(6)
  @MaxLength(20)
  @Match('password', { message: 'Re-enter the password does not match!' })
  passwordConfirm: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsPhoneNumber('VN', {
    message: 'Please enter the correct Vietnamese phone number',
  })
  phoneNumber: string;

  @ApiProperty()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({ default: RoleType.USER })
  @IsEnum(RoleType)
  role: RoleType;

  @ApiPropertyOptional()
  @IsOptional()
  hotelName?: string;
}
