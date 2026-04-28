import DOMPurify from 'dompurify';
import { marked } from 'marked';

const ALLOWED_TAGS = [
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'p',
  'br',
  'hr',
  'strong',
  'em',
  'del',
  's',
  'ul',
  'ol',
  'li',
  'blockquote',
  'code',
  'pre',
  'a',
  'span',
];

const ALLOWED_ATTR = ['href', 'title'];

const ALLOWED_URI_REGEX = /^(?:https?:|mailto:|#|\/)/i;

export function renderMarkdown(source: string): string {
  if (!source.trim()) return '';

  const rawHtml = marked.parse(source, {
    async: false,
    breaks: true,
    gfm: true,
  }) as string;

  const clean = DOMPurify.sanitize(rawHtml, {
    ALLOWED_ATTR,
    ALLOWED_TAGS,
    ALLOWED_URI_REGEXP: ALLOWED_URI_REGEX,
    KEEP_CONTENT: true,
    RETURN_TRUSTED_TYPE: false,
  });

  return typeof clean === 'string' ? clean : String(clean);
}
