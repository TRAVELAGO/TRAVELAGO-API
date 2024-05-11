import { IsDateFormat } from '@decorators/is-date-format.decorator';
import { ApiProperty, OmitType } from '@nestjs/swagger';
import { IsInt, IsNotEmpty } from 'class-validator';
import { SearchRoomDto } from './search-room.dto';
import { Transform } from 'class-transformer';

export class SearchRoomAvailableDto extends OmitType(SearchRoomDto, [
  'guestNumber',
]) {
  @ApiProperty({
    default: 1,
  })
  @Transform(({ value }) => Number(value))
  @IsInt()
  readonly guestNumber: number;

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
