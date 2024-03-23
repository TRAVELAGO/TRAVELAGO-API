import {
  Between,
  FindOperator,
  LessThanOrEqual,
  MoreThanOrEqual,
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
