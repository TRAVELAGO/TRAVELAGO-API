import { IsNotEmpty } from 'class-validator';

export class LoginDto {
  email: string;

  @IsNotEmpty()
  password: string;
}
