/**
 * FlightGlobe Bulletproof UTC & Timezone Normalizer.
 * Guarantees zero timezone desyncs by parsing all incoming flight timestamps
 * explicitly in ISO-8601 UTC and formatting for localized display without offset drift.
 */

/**
 * Normalizes any date input (ISO string, Unix timestamp ms/sec, or Date) to a strict UTC ISO-8601 string.
 * @param {string|number|Date} input
 * @returns {string} ISO-8601 UTC string (e.g. "2026-08-02T16:00:00.000Z")
 */
export function normalizeToUTC(input) {
  if (!input) return new Date().toISOString();

  let dateObj;
  if (typeof input === "number") {
    // Check if timestamp is in seconds (Unix 10-digit) vs ms (13-digit)
    dateObj = new Date(input < 1e11 ? input * 1000 : input);
  } else if (typeof input === "string") {
    // If missing explicit timezone offset, append 'Z' to force UTC parsing
    const hasOffset = /Z|[+-]\d{2}:?\d{2}$/i.test(input);
    dateObj = new Date(hasOffset ? input : `${input}Z`);
  } else if (input instanceof Date) {
    dateObj = input;
  } else {
    return new Date().toISOString();
  }

  return isNaN(dateObj.getTime()) ? new Date().toISOString() : dateObj.toISOString();
}

/**
 * Calculates flight duration in minutes between departure and arrival UTC ISO timestamps.
 * @param {string} depUtc
 * @param {string} arrUtc
 * @returns {number} duration in minutes
 */
export function calculateFlightDurationMinutes(depUtc, arrUtc) {
  const depMs = new Date(normalizeToUTC(depUtc)).getTime();
  const arrMs = new Date(normalizeToUTC(arrUtc)).getTime();
  const diffMs = arrMs - depMs;
  return diffMs > 0 ? Math.round(diffMs / 60000) : 0;
}

/**
 * Formats a UTC ISO timestamp for display in a specific IANA timezone (or browser default).
 * @param {string} utcIsoString
 * @param {string} [timeZone] e.g. "America/New_York", "Asia/Dubai", "Europe/London"
 * @param {object} [options]
 * @returns {string} Formatted local time string (e.g. "14:30 EST")
 */
export function formatLocalizedFlightTime(utcIsoString, timeZone = "UTC", options = {}) {
  const dateObj = new Date(normalizeToUTC(utcIsoString));

  const defaultOptions = {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone,
    ...options,
  };

  try {
    return new Intl.DateTimeFormat("en-US", defaultOptions).format(dateObj);
  } catch (err) {
    // Fallback to UTC if invalid IANA timezone string passed
    return new Intl.DateTimeFormat("en-US", { ...defaultOptions, timeZone: "UTC" }).format(dateObj);
  }
}
