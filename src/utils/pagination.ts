import { EntityTarget, FindManyOptions } from 'typeorm';
import { checkPropertyOfEntity } from './check-property';
import { Order } from '@constants/order';
import { Cache } from 'cache-manager';

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

export async function getOrderOption<T>(
  entity: EntityTarget<T>,
  order: string,
  cacheManager: Cache,
): Promise<FindManyOptions<T>> {
  if (!order || typeof order !== 'string') {
    return {};
  }

  const [column, direction] = order.split(',');
  const orderOption: FindManyOptions<T> = {};

  // check column belongs to entity and correct sort direction
  if (
    (direction.toUpperCase() === Order.ASC ||
      direction.toUpperCase() === Order.DESC) &&
    (await checkPropertyOfEntity(entity, [column, 'id'], cacheManager))
  ) {
    orderOption.order = {};
    orderOption.order[column] = direction;
    column !== 'id' && (orderOption.order['id'] = Order.ASC);
  }

  return orderOption;
}
