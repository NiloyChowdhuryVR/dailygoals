import { subHours, startOfDay, format } from 'date-fns';

/**
 * Returns the effective date considering a 4:00 AM daily reset boundary.
 * Any time between 00:00:00 and 03:59:59 is considered part of the previous calendar day.
 */
export function getEffectiveDate(date: Date = new Date()): Date {
  return startOfDay(subHours(date, 4));
}

/**
 * Returns the effective today ISO date string (yyyy-MM-dd) considering 4:00 AM reset.
 */
export function getEffectiveTodayIso(date: Date = new Date()): string {
  return format(getEffectiveDate(date), 'yyyy-MM-dd');
}
