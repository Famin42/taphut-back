import * as moment from 'moment';

export function getUnixTimeInSeconds(d = new Date()): number {
  return Math.floor(d.getTime() / 1000);
}

export function increaseDate(
  increaseDate: moment.DurationInputArg1,
  dateType: moment.DurationInputArg2,
  date = new Date()
): Date {
  return moment(date).add(increaseDate, dateType).toDate();
}

export function decreaseDate(
  increaseDate: moment.DurationInputArg1,
  dateType: moment.DurationInputArg2,
  date = new Date()
): Date {
  return moment(date).subtract(increaseDate, dateType).toDate();
}

export function isAfter(base: Date | string, toCompare: Date | string): boolean {
  return moment(base).isAfter(toCompare);
}

/**
 * get minute of day for a date
 * @param {Date} date
 */
export function minuteOfDay(date: Date): number {
  return date.getUTCMinutes() + 60 * date.getUTCHours();
}

export function daysAgo(nDays: number, d = new Date()): Date {
  return moment(d).subtract(nDays, 'd').toDate();
}

export function minutesAgo(nMinutes: number, d = new Date()): Date {
  return moment(d).subtract(nMinutes, 'm').toDate();
}

/**
 * Get the start and end dates of the previous week (UTC)
 * @param d date from which to compute last week
 * @param dayOfWeekOffset get week range starting on this day of the week
 * (0=Sunday, 6=Saturday)
 * @param hourOffset get a week starting and ending on this hour (UTC)
 */
export function getLastWeekRange(
  d: Date,
  dayOfWeekOffset = 0,
  hourOffset = 0
): {
  start: string;
  end: string;
} {
  const endLater = moment(d).utc().startOf('week').add(dayOfWeekOffset, 'd').add(hourOffset, 'h');
  const endEarlier = endLater.clone().subtract(1, 'w');
  // it's possible that our start of week will be after d since we're adding
  // some days and hours to it. Check if endLater is after d, and if so, bump a
  // week earlier instead
  const end = endLater.isAfter(d) ? endEarlier : endLater;
  const start = end.clone().subtract(1, 'w');
  return { start: start.toISOString(), end: end.toISOString() };
}

/**
 * Gets the date for the start of a date's current hour
 * @param d input date
 */
export function getHourStart(d: Date | string): Date {
  return moment(d).utc().startOf('hour').toDate();
}

export function getISODate(d: Date | string): string {
  return moment(d).utc().format('YYYY-MM-DD');
}

export function getDayPath(d: Date | string): string {
  return moment(d).utc().format('YYYY/MM/DD');
}

export function getHourPath(d: Date | string): string {
  return moment(d).utc().format('YYYY/MM/DD/HH');
}

export function parseISODate(s: string): Date {
  return moment.utc(s).toDate();
}

export function stripMillisISO(s: string): string {
  return `${s.substr(0, 19)}Z`;
}

export function stripMillisUnixTime(ut: number): number {
  return Math.floor(ut / 1000);
}

export function appendMillisUnixTime(ut: number): number {
  return Math.floor(ut * 1000);
}
