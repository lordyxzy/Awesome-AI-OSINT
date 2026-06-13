import { request } from '../utils/http.js';
import { ensureUrl } from '../utils/validate.js';
import { escapeHtml, code } from '../utils/format.js';

const INTERESTING = [
  'server',
  'x-powered-by',
  'via',
  'x-aspnet-version',
  'set-cookie',
  'content-security-policy',
  'strict-transport-security',
  'x-frame-options',
  'x-content-type-options',
  'cf-ray',
  'x-cache',
  'x-amz-cf-id',
  'content-type',
  'location',
];

/** Inspect HTTP response headers — useful for fingerprinting tech stack. */
export function registerHeaders(bot) {
  bot.command('headers', async (ctx) => {
    const raw = ctx.message.text.replace(/^\/headers(@\S+)?/, '').trim();
    if (!raw) {
      return ctx.replyWithHTML('Usage: <code>/headers example.com</code>');
    }
    const url = ensureUrl(raw);

    let res;
    try {
      res = await request(url, { method: 'GET' });
    } catch (err) {
      return ctx.replyWithHTML(`⚠️ Request failed: ${code(err.message)}`);
    }

    const lines = [
      `🧾 HTTP headers for ${code(res.url || url)}`,
      `<b>Status:</b> ${code(String(res.status))}`,
      '',
    ];

    const headerLines = [];
    for (const [key, value] of res.headers.entries()) {
      const isKey = INTERESTING.includes(key.toLowerCase());
      const shown = value.length > 200 ? `${value.slice(0, 200)}…` : value;
      headerLines.push(`${isKey ? '⭐ ' : ''}<b>${escapeHtml(key)}:</b> ${escapeHtml(shown)}`);
    }
    // Put starred (interesting) headers first.
    headerLines.sort((a, b) => (b.startsWith('⭐') ? 1 : 0) - (a.startsWith('⭐') ? 1 : 0));
    lines.push(...headerLines);

    lines.push('', '<i>⭐ marks headers that often reveal the tech stack or CDN.</i>');
    return ctx.replyWithHTML(lines.join('\n'), { disable_web_page_preview: true });
  });
}
