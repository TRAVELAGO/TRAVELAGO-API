import { EntityTarget } from 'typeorm';
import AppDataSource from '@database/data-source';
import { Cache } from 'cache-manager';

export async function checkPropertyOfEntity<T>(
  entity: EntityTarget<T>,
  value: string[],
  cacheManager: Cache,
): Promise<boolean> {
  let columns: string[] = await cacheManager.get<string[]>(entity.toString());

  if (!columns) {
    columns = getColumnsOfEntity<T>(entity);
    // set cache 1d
    await cacheManager.set(entity.toString(), columns, 24 * 60 * 60 * 1000);
  }

  return value.every((column) => columns.includes(column));
}

export function getColumnsOfEntity<T>(entity: EntityTarget<T>): string[] {
  const columns = AppDataSource.getMetadata(entity).ownColumns.map(
    (column) => column.propertyName,
  );

  return columns;
}
