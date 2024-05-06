import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateFeedbackDto {
  @ApiProperty()
  @IsInt()
  @Min(0)
  @Max(5)
  rate: number;

  @ApiProperty()
  @IsString()
  @IsOptional()
  comment: string;
}
