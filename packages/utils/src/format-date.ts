import { pluralize } from "./pluralize";

/**
 * Options for the formatDate function
 */
interface FormatDateOptions {
  /** The locale to use for formatting (default: 'en-US') */
  locale?: string;
  /** Whether to include the time (default: false) */
  includeTime?: boolean;
  /** Whether to use relative time (e.g., "2 hours ago") (default: false) */
  relative?: boolean;
  /** Custom date format string (overrides other options) */
  format?: string;
  /** Whether to show the year (default: true) */
  showYear?: boolean;
  /** Whether to show the day of the week (default: false) */
  showDayOfWeek?: boolean;
}

/**
 * Formats a date from database format to a human-readable string
 * @param date - The date to format (can be Date object, string, or number)
 * @param options - Configuration options for date formatting
 * @returns Formatted date string
 *
 * @example
 * formatDate('2024-01-15T10:30:00Z') // 'Jan 15, 2024'
 * formatDate('2024-01-15T10:30:00Z', { includeTime: true }) // 'Jan 15, 2024 at 10:30 AM'
 * formatDate('2024-01-15T10:30:00Z', { relative: true }) // '2 hours ago'
 * formatDate('2024-01-15T10:30:00Z', { showDayOfWeek: true }) // 'Monday, Jan 15, 2024'
 */
export function formatDate(
  date: Date | string | number,
  options: FormatDateOptions = {}
): string {
  const {
    locale = "en-US",
    includeTime = false,
    relative = false,
    format,
    showYear = true,
    showDayOfWeek = false,
  } = options;

  // Convert to Date object if it's a string or number
  const dateObj =
    typeof date === "string" || typeof date === "number"
      ? new Date(date)
      : date;

  // Check if the date is valid
  if (isNaN(dateObj.getTime())) {
    return "Invalid date";
  }

  let effectiveIncludeTime = includeTime;

  // Handle relative time formatting
  if (relative) {
    const now = new Date();
    const diffInMs = now.getTime() - dateObj.getTime();
    const diffInDays = diffInMs / (1000 * 60 * 60 * 24);
    if (diffInDays < 1) {
      return formatRelativeTime(dateObj);
    }
    // If more than 1 day, fall through to normal formatting
    effectiveIncludeTime = false;
  }

  // Handle custom format
  if (format) {
    return formatCustomDate(dateObj, format, locale);
  }

  // Default formatting
  const now = new Date();
  const isToday = dateObj.toDateString() === now.toDateString();
  const isThisYear = dateObj.getFullYear() === now.getFullYear();

  let dateString = "";

  if (showDayOfWeek) {
    dateString += `${dateObj.toLocaleDateString(locale, { weekday: "long" })}, `;
  }

  if (isToday) {
    dateString += "Today";
  } else if (isThisYear && !showYear) {
    dateString += dateObj.toLocaleDateString(locale, {
      month: "short",
      day: "numeric",
    });
  } else {
    dateString += dateObj.toLocaleDateString(locale, {
      month: "short",
      day: "numeric",
      year: showYear ? "numeric" : undefined,
    });
  }

  if (effectiveIncludeTime) {
    dateString +=
      " • " +
      dateObj.toLocaleTimeString(locale, {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
  }

  return dateString;
}

/**
 * Formats a date as relative time (e.g., "2 hours ago")
 */
function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return "just now";
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} ${pluralize("minute", diffInMinutes)} ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} ${pluralize("hour", diffInHours)} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} ${pluralize("day", diffInDays)} ago`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `${diffInWeeks} ${pluralize("week", diffInWeeks)} ago`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} ${pluralize("month", diffInMonths)} ago`;
  }

  const diffInYears = Math.floor(diffInDays / 365);
  return `${diffInYears} ${pluralize("year", diffInYears)} ago`;
}

/**
 * Formats a date using a custom format string
 */
function formatCustomDate(date: Date, format: string, locale: string): string {
  const formatMap: Record<string, string> = {
    YYYY: date.getFullYear().toString(),
    YY: date.getFullYear().toString().slice(-2),
    MM: (date.getMonth() + 1).toString().padStart(2, "0"),
    M: (date.getMonth() + 1).toString(),
    MMM: date.toLocaleDateString(locale, { month: "short" }),
    MMMM: date.toLocaleDateString(locale, { month: "long" }),
    DD: date.getDate().toString().padStart(2, "0"),
    D: date.getDate().toString(),
    ddd: date.toLocaleDateString(locale, { weekday: "short" }),
    dddd: date.toLocaleDateString(locale, { weekday: "long" }),
    HH: date.getHours().toString().padStart(2, "0"),
    H: date.getHours().toString(),
    hh: (date.getHours() % 12 || 12).toString().padStart(2, "0"),
    h: (date.getHours() % 12 || 12).toString(),
    mm: date.getMinutes().toString().padStart(2, "0"),
    m: date.getMinutes().toString(),
    ss: date.getSeconds().toString().padStart(2, "0"),
    s: date.getSeconds().toString(),
    A: date.getHours() >= 12 ? "PM" : "AM",
    a: date.getHours() >= 12 ? "pm" : "am",
  };

  let result = format;
  Object.entries(formatMap).forEach(([key, value]) => {
    result = result.replace(new RegExp(key, "g"), value);
  });

  return result;
}
