import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateFeedbackDto {
  @ApiProperty()
  @IsInt()
  @Min(1)
  @Max(5)
  rate: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  comment: string;
}
