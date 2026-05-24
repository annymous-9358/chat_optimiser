/**
 * Strips markdown code fences and normalises whitespace so the raw LLM
 * output is easier to search for JSON tokens.
 */
function stripFences(raw: string): string {
  return raw
    .replace(/^```(?:json|javascript|ts|typescript)?\s*/im, '')
    .replace(/```\s*$/im, '')
    .trim();
}

/**
 * Sanitizes a raw JSON string returned by an LLM by escaping literal control
 * characters (newlines, carriage returns, tabs, etc.) that appear inside JSON
 * string values.  JSON.parse() rejects any control character < 0x20 that is
 * not properly escaped, and LLMs frequently emit them verbatim.
 */
export function sanitizeJSON(raw: string): string {
  return raw.replace(
    /"((?:[^"\\]|\\[\s\S])*)"/g,
    (_full, content: string) =>
      '"' +
      content
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '\\r')
        .replace(/\t/g, '\\t')
        .replace(/[\x00-\x08\x0b\x0c\x0e-\x1f]/g, '') +
      '"',
  );
}

/**
 * Extracts and parses a JSON **array** from a raw LLM response.
 * Handles:
 *  - markdown code fences (```json ... ```)
 *  - literal control characters inside string values
 *  - greedy LLM preamble/postamble text
 *
 * Returns the parsed array, or throws with a clear message.
 */
export function parseJSONArray(raw: string): string[] {
  const clean = stripFences(raw);
  const match = clean.match(/\[[\s\S]*\]/);
  if (!match) throw new Error('Could not parse response — no JSON array found');
  const arr = JSON.parse(sanitizeJSON(match[0]));
  if (!Array.isArray(arr) || arr.length === 0) throw new Error('Invalid response — empty array');
  return arr as string[];
}

/**
 * Extracts and parses a JSON **object** from a raw LLM response.
 * Same robustness as parseJSONArray.
 */
export function parseJSONObject(raw: string): Record<string, unknown> {
  const clean = stripFences(raw);
  const match = clean.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('Could not parse response — no JSON object found');
  return JSON.parse(sanitizeJSON(match[0])) as Record<string, unknown>;
}
