import { FindManyOptions } from 'typeorm';

export function getPaginationOption<T>(
  pageNumber?: number,
  pageSize?: number,
): FindManyOptions<T> {
  if (pageNumber && pageSize) {
    // pageNumber < 1 => pageNumber = 1
    pageNumber = pageNumber < 1 ? 1 : pageNumber;
    // pagination
    const paginationOption: FindManyOptions<T> = {
      take: pageSize,
      skip: (pageNumber - 1) * pageSize,
    };
    return paginationOption;
  }
  return {};
}
