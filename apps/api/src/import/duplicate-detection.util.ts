function normalizeDescription(description: string): string {
  return description.trim().toLowerCase().replace(/\s+/g, ' ');
}

// First-pass duplicate detection key: accountId + day + signed amount +
// normalized description. Deliberately NOT based on description alone.
// Easy to extend later (e.g. fuzzy matching, external bank reference ids).
export function buildDuplicateKey(
  accountId: string,
  date: Date,
  amount: string,
  description: string,
): string {
  const isoDate = date.toISOString().slice(0, 10);
  return `${accountId}|${isoDate}|${amount}|${normalizeDescription(description)}`;
}
