import {
  Between,
  FindOperator,
  LessThanOrEqual,
  MoreThanOrEqual,
  Raw,
} from 'typeorm';

export function between(from: number, to: number): FindOperator<number> {
  return from && to
    ? Between(from, to)
    : from
      ? MoreThanOrEqual(from)
      : to
        ? LessThanOrEqual(to)
        : undefined;
}

export function findInJsonArray(value: string, dbType: string): any {
  return value
    ? Raw((columnAlias) => {
        const searchArray = value.split(',');
        let result;

        searchArray &&
          (dbType === 'mysql'
            ? searchArray.forEach((value, i) => {
                if (i === 0) {
                  result = `JSON_CONTAINS(${columnAlias}, '"${value}"', '$')`;
                  // result = JSON_SEARCH(${columnAlias}, 'one', '${value}', NULL, '$[*]') IS NOT NULL
                } else {
                  result += ` AND JSON_CONTAINS(${columnAlias}, '"${value}"', '$')`;
                }
              })
            : (result = `${columnAlias} ::jsonb @> '${JSON.stringify(searchArray)}'::jsonb`));
        return result ?? '1';
      })
    : undefined;
}
