export type Period = "today" | "week" | "month" | "year" | "custom";

export const toDate = (value: string | number | Date) => {
  return value instanceof Date ? value : new Date(value);
};

export const formatDate = (value: string | Date, locale: string) => {
  const date = toDate(value);
  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(date);
};

export const formatDayTitle = (value: string | Date, locale: string) => {
  const date = toDate(value);
  return new Intl.DateTimeFormat(locale, {
    weekday: "short",
    day: "2-digit",
    month: "short"
  }).format(date);
};

export const startOfDay = (value: string | Date) => {
  const date = toDate(value);
  date.setHours(0, 0, 0, 0);
  return date;
};

export const isSameDay = (a: string | Date, b: string | Date) => {
  return startOfDay(a).getTime() === startOfDay(b).getTime();
};

export const startOfWeek = (value: string | Date, weekStartsOn: 0 | 1) => {
  const date = startOfDay(value);
  const day = date.getDay();
  const diff = (day - weekStartsOn + 7) % 7;
  date.setDate(date.getDate() - diff);
  return date;
};

export const startOfMonth = (value: string | Date) => {
  const date = startOfDay(value);
  date.setDate(1);
  return date;
};

export const startOfYear = (value: string | Date) => {
  const date = startOfDay(value);
  date.setMonth(0, 1);
  return date;
};

export const isWithin = (value: string | Date, start: Date, end: Date) => {
  const time = toDate(value).getTime();
  return time >= start.getTime() && time <= end.getTime();
};

export const getPeriodRange = (
  period: Period,
  weekStartsOn: 0 | 1,
  now = new Date()
) => {
  const end = new Date(now);
  let start = new Date(now);
  if (period === "today") {
    start = startOfDay(now);
  }
  if (period === "week") {
    start = startOfWeek(now, weekStartsOn);
  }
  if (period === "month") {
    start = startOfMonth(now);
  }
  if (period === "year") {
    start = startOfYear(now);
  }
  return { start, end };
};
