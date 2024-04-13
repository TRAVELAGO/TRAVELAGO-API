import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsPhoneNumber,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Match } from '@decorators/match-password.decorator';
import { RoleType } from '@constants/role-type';

export class RegisterDto {
  @ApiProperty({
    default: 'test@gmail.com',
  })
  @IsNotEmpty()
  @IsEmail()
  readonly email: string;

  @ApiProperty({
    default: 'Secret!@2121',
  })
  @IsString()
  @MinLength(6)
  @MaxLength(20)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'Password too weak!',
  })
  readonly password: string;

  @ApiProperty({
    default: 'Secret!@2121',
  })
  @IsString()
  @MinLength(6)
  @MaxLength(20)
  @Match('password', { message: 'Re-enter the password does not match!' })
  readonly passwordConfirm: string;

  @ApiProperty({
    default: '0987654321',
  })
  @IsNotEmpty()
  @IsPhoneNumber('VN', {
    message: 'Please enter the correct Vietnamese phone number',
  })
  readonly phoneNumber: string;

  @ApiProperty()
  @IsNotEmpty()
  readonly fullName: string;

  @ApiProperty({ default: RoleType.USER })
  @IsEnum(RoleType)
  readonly role: RoleType;
}
