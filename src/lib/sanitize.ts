/**
 * Server-safe HTML sanitizer for rich-text content (Tiptap, offer letters, etc.)
 *
 * Uses isomorphic-dompurify (DOMPurify + jsdom) so attribute values are properly
 * re-encoded — the previous regex-based sanitizer had a quote-breakout bypass.
 *
 * Usage:
 *   import { sanitizeHtml, sanitizeText } from '@/lib/sanitize';
 *
 *   // Before storing rich-text from Tiptap:
 *   const clean = sanitizeHtml(rawHtml);
 *
 *   // Strip all HTML tags (plain text):
 *   const plain = sanitizeText(rawHtml);
 */

import DOMPurify from 'isomorphic-dompurify';

const ALLOWED_TAGS = [
  'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'del', 'mark',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'ul', 'ol', 'li',
  'blockquote', 'pre', 'code',
  'a', 'span', 'div',
  'table', 'thead', 'tbody', 'tr', 'th', 'td',
  'hr',
];

const ALLOWED_ATTR = [
  'href', 'title', 'target', 'rel',
  'class', 'style',
  'colspan', 'rowspan', 'scope',
];

/** Only allow safe URL schemes in href (blocks javascript:/data:/vbscript:). */
const SAFE_URI = /^(?:(?:https?|mailto|tel):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i;

/**
 * Sanitize an HTML string to a safe subset.
 * Strips disallowed tags and dangerous attributes; encodes attribute values.
 */
export function sanitizeHtml(dirty: string): string {
  if (!dirty || typeof dirty !== 'string') return '';

  const clean = DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false,
    ALLOWED_URI_REGEXP: SAFE_URI,
    FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form', 'input'],
    FORBID_ATTR: ['onerror', 'onclick', 'onload', 'onmouseover', 'onfocus', 'onblur'],
  });

  // Ensure external links get noopener/noreferrer
  return clean.replace(
    /<a\s([^>]*href=["'][^"']*["'][^>]*)>/gi,
    (_match, attrs: string) => {
      let next = attrs;
      if (!/\brel\s*=/i.test(next)) {
        next += ' rel="noopener noreferrer"';
      }
      if (!/\btarget\s*=/i.test(next)) {
        next += ' target="_blank"';
      }
      return `<a ${next}>`;
    },
  );
}

/**
 * Strip all HTML tags and return plain text.
 */
export function sanitizeText(html: string): string {
  if (!html || typeof html !== 'string') return '';
  const stripped = DOMPurify.sanitize(html, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
  return stripped
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s{2,}/g, ' ')
    .trim();
}
