import { BLACK_LIST_TOKEN } from '@constants/constants';

export const getBlacklistKey = (value: any): string => {
  return `${BLACK_LIST_TOKEN}|${value}`;
};
