import { Transform } from 'class-transformer';
import sanitizeHtml from 'sanitize-html';

// Strips any HTML/script markup from a free-text DTO field before validation.
export function SanitizeHtml(): PropertyDecorator {
  return Transform(({ value }: { value: unknown }) =>
    typeof value === 'string'
      ? sanitizeHtml(value, { allowedTags: [], allowedAttributes: {} }).trim()
      : value,
  );
}
