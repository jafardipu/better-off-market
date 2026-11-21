/**
 * Format calendar dates for US display as MM-DD-YYYY.
 * Non-date labels like "ASAP" pass through unchanged.
 * Keep HTML <input type="date"> values as YYYY-MM-DD in forms.
 */
export function formatDateUS(
  value?: string | Date | null,
  fallback = "—",
): string {
  if (value == null || value === "") return fallback;

  if (typeof value === "string") {
    const trimmed = value.trim();
    const dateOnly = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (dateOnly) {
      const [, year, month, day] = dateOnly;
      return `${month}-${day}-${year}`;
    }

    const parsed = Date.parse(trimmed);
    if (Number.isNaN(parsed)) return trimmed;

    const date = new Date(parsed);
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${month}-${day}-${date.getFullYear()}`;
  }

  if (Number.isNaN(value.getTime())) return fallback;
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${month}-${day}-${value.getFullYear()}`;
}

/** 24-hour "HH:mm" → "h:mm A" (2:00 PM, not 02:00 PM). */
export function formatTimeUS(value?: string | null, fallback = ""): string {
  if (value == null || value.trim() === "") return fallback;

  const match = value.trim().match(/^(\d{1,2}):(\d{2})/);
  if (!match) return value;

  const hour24 = Number(match[1]);
  const minute = match[2];
  if (hour24 > 23 || Number(minute) > 59) return value;

  const period = hour24 >= 12 ? "PM" : "AM";
  const hour12 = hour24 % 12 || 12;
  return `${hour12}:${minute} ${period}`;
}
