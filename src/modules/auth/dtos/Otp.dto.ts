import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class Otpdto {

  @IsNotEmpty()
    readonly code: string;
}
