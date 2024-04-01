import { ApiProperty } from '@nestjs/swagger';
import { PageMetaDtoParameters } from '../interfaces/page-meta-parameters.interface';

export class PageMetaDto {
  @ApiProperty()
  readonly pageNumber: number;

  @ApiProperty()
  readonly pageSize: number;

  @ApiProperty()
  readonly itemCount: number;

  @ApiProperty()
  readonly pageCount: number;

  @ApiProperty()
  readonly hasPreviousPage: boolean;

  @ApiProperty()
  readonly hasNextPage: boolean;

  constructor({ pageOptionsDto, itemCount }: PageMetaDtoParameters) {
    this.pageNumber = pageOptionsDto.pageNumber;
    this.pageSize = pageOptionsDto.pageSize;
    this.itemCount = itemCount;
    this.pageCount = Math.ceil(this.itemCount / this.pageSize);
    this.hasPreviousPage = this.pageNumber > 1;
    this.hasNextPage = this.pageNumber < this.pageCount;
  }
}
