/** @vitest-environment jsdom */
import { describe, expect, it } from 'vitest';
import { renderMarkdown } from './markdown';

describe('renderMarkdown', () => {
  it('renders headings', () => {
    const html = renderMarkdown('# title\n\n## subtitle');
    expect(html).toContain('<h1>title</h1>');
    expect(html).toContain('<h2>subtitle</h2>');
  });

  it('renders bold and italic', () => {
    const html = renderMarkdown('**bold** and *italic*');
    expect(html).toContain('<strong>bold</strong>');
    expect(html).toContain('<em>italic</em>');
  });

  it('renders unordered lists', () => {
    const html = renderMarkdown('- one\n- two\n- three');
    expect(html).toContain('<ul>');
    expect(html.match(/<li>/g)?.length).toBe(3);
  });

  it('renders inline code and code blocks', () => {
    const html = renderMarkdown('inline `code` and\n\n```\nblock\n```');
    expect(html).toContain('<code>code</code>');
    expect(html).toContain('<pre>');
    expect(html).toContain('block');
  });

  it('renders links with safe schemes', () => {
    const html = renderMarkdown('[example](https://example.com)');
    expect(html).toContain('<a href="https://example.com">example</a>');
  });

  it('strips script tags', () => {
    const html = renderMarkdown('hello <script>alert(1)</script> world');
    expect(html).not.toContain('<script>');
    expect(html).not.toContain('alert(1)');
  });

  it('strips javascript: URLs', () => {
    const html = renderMarkdown('[bad](javascript:alert(1))');
    expect(html).not.toContain('javascript:');
  });

  it('strips event-handler attributes', () => {
    const html = renderMarkdown('<p onclick="alert(1)">hi</p>');
    expect(html).not.toContain('onclick');
  });

  it('strips iframe tags', () => {
    const html = renderMarkdown('<iframe src="evil"></iframe>');
    expect(html).not.toContain('<iframe');
  });

  it('returns empty string for empty input', () => {
    expect(renderMarkdown('').trim()).toBe('');
    expect(renderMarkdown('   ').trim()).toBe('');
  });
});
