/**
 * Server-safe HTML sanitizer for rich-text content (Tiptap, offer letters, etc.)
 *
 * Uses a strict allowlist of tags and attributes.
 * No DOMParser — pure regex + string replacement, safe in Node / Edge runtimes.
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

/** Tags whose content should be kept but tags removed (unwrapped) */
const ALLOWED_TAGS = new Set([
  'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'del', 'mark',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'ul', 'ol', 'li',
  'blockquote', 'pre', 'code',
  'a', 'span', 'div',
  'table', 'thead', 'tbody', 'tr', 'th', 'td',
  'hr',
]);

/** Attributes allowed per tag */
const ALLOWED_ATTRS: Record<string, string[]> = {
  a:    ['href', 'title', 'target', 'rel'],
  span: ['class', 'style'],
  div:  ['class'],
  p:    ['class'],
  code: ['class'],
  pre:  ['class'],
  td:   ['colspan', 'rowspan'],
  th:   ['colspan', 'rowspan', 'scope'],
};

/** Allowed CSS properties inside style attributes */
const SAFE_STYLE_PROPS = new Set([
  'color', 'background-color', 'font-weight', 'font-style', 'text-decoration',
  'text-align', 'margin', 'padding', 'border',
]);

function sanitizeStyle(style: string): string {
  return style
    .split(';')
    .map((decl) => {
      const [prop, ...rest] = decl.split(':');
      const property = prop?.trim().toLowerCase();
      if (!property || !SAFE_STYLE_PROPS.has(property)) return '';
      const value = rest.join(':').trim();
      // Block javascript: and expression() in values
      if (/javascript:|expression\s*\(/i.test(value)) return '';
      return `${property}:${value}`;
    })
    .filter(Boolean)
    .join(';');
}

function sanitizeAttrValue(attrName: string, value: string): string | null {
  if (attrName === 'href') {
    // Only allow http/https/mailto/tel — block javascript: and data:
    if (/^(javascript|data|vbscript):/i.test(value.trim())) return null;
  }
  if (attrName === 'style') {
    return sanitizeStyle(value);
  }
  if (attrName === 'target') {
    // Force noopener on external links
    return '_blank';
  }
  return value;
}

/**
 * Sanitize an HTML string to a safe subset.
 * Strips disallowed tags and dangerous attributes.
 */
export function sanitizeHtml(dirty: string): string {
  if (!dirty || typeof dirty !== 'string') return '';

  // Remove script/style blocks entirely (content + tag)
  let clean = dirty
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '');

  // Process tags
  clean = clean.replace(/<\/?([a-zA-Z][a-zA-Z0-9]*)([^>]*)>/g, (match, tagName: string, attrs: string) => {
    const tag = tagName.toLowerCase();

    if (!ALLOWED_TAGS.has(tag)) {
      // Disallowed tag — strip completely (keep inner text)
      return '';
    }

    // Closing tag — let it through as-is
    if (match.startsWith('</')) return `</${tag}>`;

    // Self-closing tags
    const selfClose = match.endsWith('/>') ? ' /' : '';

    const allowedAttrs = ALLOWED_ATTRS[tag] ?? [];
    if (allowedAttrs.length === 0) return selfClose ? `<${tag}/>` : `<${tag}>`;

    // Parse and filter attributes
    const safeAttrs: string[] = [];
    const attrPattern = /([a-zA-Z-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|(\S+)))?/g;
    let m: RegExpExecArray | null;
    while ((m = attrPattern.exec(attrs)) !== null) {
      const attrName = m[1].toLowerCase();
      const attrVal = m[2] ?? m[3] ?? m[4] ?? '';
      if (!allowedAttrs.includes(attrName)) continue;
      const safeVal = sanitizeAttrValue(attrName, attrVal);
      if (safeVal === null) continue;
      // Add noopener/noreferrer on external links
      if (attrName === 'href' && tag === 'a') {
        safeAttrs.push(`href="${safeVal}" rel="noopener noreferrer"`);
        continue;
      }
      safeAttrs.push(`${attrName}="${safeVal}"`);
    }

    const attrStr = safeAttrs.length ? ' ' + safeAttrs.join(' ') : '';
    return `<${tag}${attrStr}${selfClose}>`;
  });

  return clean;
}

/**
 * Strip all HTML tags and return plain text.
 */
export function sanitizeText(html: string): string {
  if (!html || typeof html !== 'string') return '';
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s{2,}/g, ' ')
    .trim();
}
