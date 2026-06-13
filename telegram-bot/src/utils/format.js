/** Escape text for Telegram HTML parse mode. */
export function escapeHtml(text = '') {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/** Wrap text in a monospace code span. */
export function code(text = '') {
  return `<code>${escapeHtml(text)}</code>`;
}

/** Build a clickable HTML link. */
export function link(label, url) {
  return `<a href="${escapeHtml(url)}">${escapeHtml(label)}</a>`;
}

/**
 * Split a long message into Telegram-safe chunks (< 4096 chars),
 * breaking on newlines where possible.
 */
export function chunk(text, max = 3800) {
  const lines = String(text).split('\n');
  const chunks = [];
  let current = '';
  for (const line of lines) {
    if ((current + '\n' + line).length > max) {
      if (current) chunks.push(current);
      current = line;
    } else {
      current = current ? `${current}\n${line}` : line;
    }
  }
  if (current) chunks.push(current);
  return chunks;
}

/** Send a possibly long HTML message in multiple parts. */
export async function replyLong(ctx, text, extra = {}) {
  const parts = chunk(text);
  for (const part of parts) {
    await ctx.replyWithHTML(part, { disable_web_page_preview: true, ...extra });
  }
}
