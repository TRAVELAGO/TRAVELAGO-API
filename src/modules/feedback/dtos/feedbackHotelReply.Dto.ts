import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class ReplyFeedbackDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  comment?: string;
}
