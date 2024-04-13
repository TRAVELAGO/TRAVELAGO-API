export const timeRegex = /^(?:([01]\d|2[0-3]):([0-5]\d):([0-5]\d))$/;

export const addTime = (date: Date, time: string) => {
  const [hour, minute, second] = time.split(':').map(Number);
  date.setHours(hour, minute, second);

  return date;
};

export const isValidTimeFormat = (timeString: string): boolean => {
  return timeRegex.test(timeString);
};
