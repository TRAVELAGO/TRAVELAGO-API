import { EntityTarget, FindManyOptions, SelectQueryBuilder } from 'typeorm';
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
    // Check the properties in the entity and cache them, no need to query next time
    (await checkPropertyOfEntity(entity, [column, 'id'], cacheManager))
  ) {
    orderOption.order = {};
    orderOption.order[column] = direction;
    column.toUpperCase() !== 'ID' && (orderOption.order['id'] = Order.ASC);
  }

  return orderOption;
}

export function addPaginationQuery(
  query: SelectQueryBuilder<any>,
  pageNumber?: number,
  pageSize?: number,
) {
  if (pageNumber && pageSize) {
    pageNumber = pageNumber < 1 ? 1 : pageNumber;

    query.limit(pageSize).offset((pageNumber - 1) * pageSize);
  }
}

export async function addOrderQuery(
  query: SelectQueryBuilder<any>,
  order: string,
  filterOrderColumn: string[],
) {
  if (!order || typeof order !== 'string') {
    return {};
  }

  const [column, direction] = order.split(',');

  if (!filterOrderColumn.includes(column)) {
    return;
  }

  let orderDirection: Order;
  if (direction.toUpperCase() === Order.ASC) {
    orderDirection = Order.ASC;
  } else if (direction.toUpperCase() === Order.DESC) {
    orderDirection = Order.DESC;
  } else {
    return;
  }

  query.orderBy(column, orderDirection);
  column.toUpperCase() !== 'ID' && query.addOrderBy('id', Order.ASC);
}
