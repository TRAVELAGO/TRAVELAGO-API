import { IsDateFormat } from '@decorators/is-date-format.decorator';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { SearchRoomDto } from './search-room.dto';

export class SearchRoomAvailableDto extends SearchRoomDto {
  @ApiProperty({
    default: '2024-05-14',
  })
  @IsDateFormat()
  @IsNotEmpty()
  readonly dateFrom: string;

  @ApiProperty({
    default: '2024-05-15',
  })
  @IsDateFormat()
  @IsNotEmpty()
  readonly dateTo: string;
}
