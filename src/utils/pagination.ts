import { FindManyOptions } from 'typeorm';

export function getPaginationOption(
  pageNumber?: number,
  pageSize?: number,
): FindManyOptions {
  if (pageNumber && pageSize) {
    // pageNumber < 1 => pageNumber = 1
    pageNumber = pageNumber < 1 ? 1 : pageNumber;
    // pagination
    const paginationOption: FindManyOptions = {
      take: pageSize,
      skip: (pageNumber - 1) * pageSize,
    };
    return paginationOption;
  }
  return {};
}
