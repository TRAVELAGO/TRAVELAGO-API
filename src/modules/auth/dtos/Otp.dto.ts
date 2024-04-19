import { IsNotEmpty } from 'class-validator';

export class Otpdto {
  @IsNotEmpty()
  readonly code: string;
}
