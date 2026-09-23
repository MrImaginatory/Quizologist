/**
 * MED-04 — input sanitization for user-controlled text.
 *
 * Deliberately does NOT entity-escape (& < > " ') the way validator.escape()
 * does: escaped entities would be stored literally in the database and mangle
 * legitimate names like "O'Brien" into "O&#39;Brien" everywhere they're shown.
 * React already encodes on output; this strips the actually-dangerous input:
 * markup, control characters and null bytes (which can smuggle past filters).
 */
export function sanitizeText(value: string): string {
  if (typeof value !== "string") return "";
  return value
    .replace(/<[^>]*>/g, "") // HTML/XML tags — <script>, <img onerror=...>
    .replace(/[\u0000-\u001F\u007F]/g, "") // C0 control chars, DEL, \n, \r, \t, null bytes
    .trim();
}

/** Same as sanitizeText but for case-insensitive identifiers (emails, phones). */
export function sanitizeIdentifier(value: string): string {
  return sanitizeText(value).toLowerCase();
}
