import { IsOptional } from 'class-validator';
import { PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateRoomDto } from './create-room.dto';

export class UpdateRoomDto extends PartialType(CreateRoomDto) {
  @ApiPropertyOptional()
  @IsOptional()
  readonly deleteImages: string[];
}
