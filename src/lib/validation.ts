// Shared input validation utilities for API routes.
// Validates external inputs at system boundaries (headers, request bodies).

const VALID_TIMEZONES = new Set(Intl.supportedValuesOf("timeZone"));
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const VALID_OPTIONS = new Set(["A", "B", "C", "D"]);

export function validateTimezone(raw: string | null): string {
  if (!raw || !VALID_TIMEZONES.has(raw)) return "UTC";
  return raw;
}

export function isValidUUID(value: string): boolean {
  return UUID_REGEX.test(value);
}

export function isValidOption(value: string): boolean {
  return VALID_OPTIONS.has(value);
}
