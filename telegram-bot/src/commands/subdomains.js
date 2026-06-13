import { getJson, request } from '../utils/http.js';
import { normalizeDomain, isDomain } from '../utils/validate.js';
import { escapeHtml, code, replyLong } from '../utils/format.js';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Passive subdomain enumeration via crt.sh Certificate Transparency logs (with retries). */
async function fromCrtSh(domain) {
  const url = `https://crt.sh/?q=%25.${encodeURIComponent(domain)}&output=json`;
  let lastErr;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const data = await getJson(url, { timeoutMs: 25000 });
      const set = new Set();
      for (const entry of data) {
        for (const name of String(entry.name_value || '').split('\n')) {
          const clean = name.trim().toLowerCase().replace(/^\*\./, '');
          if (clean.endsWith(domain)) set.add(clean);
        }
      }
      return [...set];
    } catch (err) {
      lastErr = err;
      if (attempt < 3) await sleep(2000 * attempt);
    }
  }
  throw lastErr;
}

/** Fallback source: HackerTarget hostsearch (free, rate-limited). */
async function fromHackerTarget(domain) {
  const res = await request(`https://api.hackertarget.com/hostsearch/?q=${encodeURIComponent(domain)}`, {
    timeoutMs: 15000,
  });
  const text = await res.text();
  if (!res.ok || /error|API count exceeded/i.test(text)) {
    throw new Error(text.slice(0, 80) || `HTTP ${res.status}`);
  }
  const set = new Set();
  for (const line of text.split('\n')) {
    const host = line.split(',')[0]?.trim().toLowerCase();
    if (host && host.endsWith(domain)) set.add(host);
  }
  return [...set];
}

export function registerSubdomains(bot) {
  bot.command('subdomains', async (ctx) => {
    const raw = (ctx.message.text.split(/\s+/)[1] || '').trim();
    if (!raw) {
      return ctx.replyWithHTML('Usage: <code>/subdomains example.com</code>');
    }
    const domain = normalizeDomain(raw);
    if (!isDomain(domain)) {
      return ctx.replyWithHTML('❌ That does not look like a valid domain.');
    }

    const progress = await ctx.replyWithHTML(
      `🌐 Enumerating subdomains of <b>${escapeHtml(domain)}</b>…`,
    );

    const found = new Set();
    const sources = [];
    const errors = [];

    const results = await Promise.allSettled([fromCrtSh(domain), fromHackerTarget(domain)]);
    const labels = ['crt.sh', 'HackerTarget'];
    results.forEach((r, i) => {
      if (r.status === 'fulfilled') {
        r.value.forEach((s) => found.add(s));
        if (r.value.length) sources.push(labels[i]);
      } else {
        errors.push(`${labels[i]}: ${r.reason?.message || 'failed'}`);
      }
    });

    await ctx.telegram.deleteMessage(progress.chat.id, progress.message_id).catch(() => {});

    const subs = [...found].sort();
    if (!subs.length) {
      const note = errors.length ? `\n\n<i>Sources unavailable:</i>\n${errors.map((e) => `• ${escapeHtml(e)}`).join('\n')}` : '';
      return replyLong(
        ctx,
        `No subdomains found for <b>${escapeHtml(domain)}</b>.${note}`,
      );
    }

    const header = `🌐 <b>${subs.length}</b> subdomains for <b>${escapeHtml(domain)}</b> (sources: ${sources.join(', ') || 'n/a'})\n`;
    const body = subs.map((s) => code(s)).join('\n');
    return replyLong(ctx, header + '\n' + body);
  });
}
