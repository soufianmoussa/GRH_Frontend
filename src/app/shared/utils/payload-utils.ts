/**
 * Recursively converts empty strings to `undefined` in an object tree.
 *
 * Rationale: backend DTOs often type fields as Java enums (e.g.
 * `SituationFamiliale`). Jackson refuses to coerce an empty string `""`
 * into an enum and returns a 500. Sending `undefined` (which JSON.stringify
 * drops from the payload) is the safe equivalent of "field not set".
 *
 * Handles arrays, plain objects, and primitives. Leaves `Date`, `File`,
 * and similar non-plain-object values untouched.
 */
export function stripEmptyStrings<T>(value: T): T {
  return cleanValue(value) as T;
}

function cleanValue(value: unknown): unknown {
  if (value === '') {
    return undefined;
  }
  if (Array.isArray(value)) {
    return value.map(cleanValue);
  }
  if (isPlainObject(value)) {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      const cleaned = cleanValue(v);
      if (cleaned !== undefined) {
        out[k] = cleaned;
      }
    }
    return out;
  }
  return value;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== 'object') return false;
  if (value instanceof Date) return false;
  if (value instanceof File) return false;
  if (value instanceof Blob) return false;
  if (Array.isArray(value)) return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}
