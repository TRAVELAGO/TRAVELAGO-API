import { VN_TIME_ZONE } from '@constants/constants';
import { parse } from 'date-fns';
import { formatInTimeZone, fromZonedTime } from 'date-fns-tz';

export const timeRegex = /^(?:([01]\d|2[0-3]):([0-5]\d):([0-5]\d))$/;

export const addTime = (date: Date, time: string) => {
  const [hour, minute, second] = time.split(':').map(Number);
  date.setHours(hour, minute, second);

  return date;
};

export const isValidTimeFormat = (timeString: string): boolean => {
  return timeRegex.test(timeString);
};

export const getVNPDate = (date: Date): string => {
  return formatInTimeZone(date, VN_TIME_ZONE, 'yyyyMMddHHmmss');
};

export const getDateFromVNPDate = (vnpDate: string) => {
  return fromZonedTime(
    parse(vnpDate, 'yyyyMMddHHmmss', new Date()),
    VN_TIME_ZONE,
  );
};
