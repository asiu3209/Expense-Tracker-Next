/**
 * Date helper functions for common date range filters
 */

// Get start of today (midnight)
export function getStartOfToday(): Date {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

// Get end of today (11:59:59 PM)
export function getEndOfToday(): Date {
  const date = new Date();
  date.setHours(23, 59, 59, 999);
  return date;
}

// Get start of current week (Monday)
export function getStartOfWeek(): Date {
  const date = new Date();
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
  const monday = new Date(date.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
}

// Get start of current month
export function getStartOfMonth(): Date {
  const date = new Date();
  return new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
}

// Get start of current year
export function getStartOfYear(): Date {
  const date = new Date();
  return new Date(date.getFullYear(), 0, 1, 0, 0, 0, 0);
}

// Get date N days ago
export function getDaysAgo(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(0, 0, 0, 0);
  return date;
}

// Get date N months ago
export function getMonthsAgo(months: number): Date {
  const date = new Date();
  date.setMonth(date.getMonth() - months);
  date.setHours(0, 0, 0, 0);
  return date;
}

// Format date for API query params (YYYY-MM-DD)
export function formatDateForAPI(date: Date): string {
  return date.toISOString().split("T")[0];
}

// Common preset date ranges
export const datePresets = {
  today: {
    startDate: formatDateForAPI(getStartOfToday()),
    endDate: formatDateForAPI(getEndOfToday()),
  },
  thisWeek: {
    startDate: formatDateForAPI(getStartOfWeek()),
    endDate: formatDateForAPI(new Date()),
  },
  thisMonth: {
    startDate: formatDateForAPI(getStartOfMonth()),
    endDate: formatDateForAPI(new Date()),
  },
  last30Days: {
    startDate: formatDateForAPI(getDaysAgo(30)),
    endDate: formatDateForAPI(new Date()),
  },
  last90Days: {
    startDate: formatDateForAPI(getDaysAgo(90)),
    endDate: formatDateForAPI(new Date()),
  },
  thisYear: {
    startDate: formatDateForAPI(getStartOfYear()),
    endDate: formatDateForAPI(new Date()),
  },
};
