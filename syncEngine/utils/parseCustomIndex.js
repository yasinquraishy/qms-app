/**
 * Parse customIndex DSL string into structured format.
 *
 * @param {string|null|undefined} indexStr - e.g. 'id, userId, [email+number]'
 * @returns {Array<{ type: 'single', field: string } | { type: 'compound', fields: string[] }>}
 */
export function parseCustomIndex(indexStr) {
  if (!indexStr) return [];
  return indexStr
    .split(",")
    .map((s) => {
      const trimmed = s.trim();
      if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
        // Compound: [field1+field2]
        const inner = trimmed.slice(1, -1);
        const fields = inner.split("+").map((f) => f.trim()).filter(Boolean);
        return { type: "compound", fields };
      } else {
        // Single field
        return { type: "single", field: trimmed };
      }
    })
    .filter(
      (item) =>
        item.type === "single"
          ? item.field
          : item.type === "compound" && item.fields.length > 0,
    );
}
