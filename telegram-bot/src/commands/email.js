import { getJson } from '../utils/http.js';
import { isEmail, emailDomain } from '../utils/validate.js';
import { escapeHtml, code, link, replyLong } from '../utils/format.js';

const google = (q) => `https://www.google.com/search?q=${encodeURIComponent(q)}`;

/** Check whether the domain can receive mail (has MX records). */
async function hasMx(domain) {
  try {
    const data = await getJson(`https://dns.google/resolve?name=${domain}&type=MX`, {
      headers: { Accept: 'application/dns-json' },
    });
    return Boolean((data.Answer || []).length);
  } catch {
    return null;
  }
}

export function registerEmail(bot) {
  bot.command('email', async (ctx) => {
    const email = (ctx.message.text.split(/\s+/)[1] || '').trim().toLowerCase();
    if (!email) {
      return ctx.replyWithHTML('Usage: <code>/email john@example.com</code>');
    }
    if (!isEmail(email)) {
      return ctx.replyWithHTML('❌ That does not look like a valid email address.');
    }

    const domain = emailDomain(email);
    const local = email.split('@')[0];
    const mx = await hasMx(domain);

    const lines = [
      `📧 OSINT pivots for ${code(email)}`,
      '',
      `<b>Format:</b> valid ✅`,
      `<b>Domain:</b> ${code(domain)}`,
      `<b>Mail (MX):</b> ${mx === null ? '—' : mx ? 'present ✅' : 'none ❌ (cannot receive mail)'}`,
      '',
      '<b>Breach &amp; exposure checks</b>',
      `• ${link('Have I Been Pwned', `https://haveibeenpwned.com/account/${encodeURIComponent(email)}`)}`,
      `• ${link('DeHashed', `https://www.dehashed.com/search?query=${encodeURIComponent(email)}`)}`,
      `• ${link('Intelligence X', `https://intelx.io/?s=${encodeURIComponent(email)}`)}`,
      `• ${link('EPIEOS', 'https://epieos.com/')} (paste the address there)`,
      '',
      '<b>Search engine pivots</b>',
      `<code>${escapeHtml(`"${email}"`)}</code> → ${link('search', google(`"${email}"`))}`,
      `<code>${escapeHtml(`"${email}" (site:pastebin.com OR site:github.com)`)}</code> → ${link('search', google(`"${email}" (site:pastebin.com OR site:github.com)`))}`,
      `<code>${escapeHtml(`intext:"${email}" filetype:xlsx OR filetype:csv`)}</code> → ${link('search', google(`intext:"${email}" filetype:xlsx OR filetype:csv`))}`,
      '',
      `<b>Username pivot:</b> try <code>/username ${escapeHtml(local)}</code>`,
      '',
      '<i>Heuristic guidance only — always confirm findings against the original source.</i>',
    ];

    return replyLong(ctx, lines.join('\n'));
  });
}
