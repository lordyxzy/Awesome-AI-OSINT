import { getJson } from '../utils/http.js';
import { normalizeDomain, isDomain } from '../utils/validate.js';
import { escapeHtml, code, link } from '../utils/format.js';

const RECORD_TYPES = ['A', 'AAAA', 'MX', 'NS', 'TXT', 'CNAME', 'SOA'];

/** Resolve a DNS record type using Google's DNS-over-HTTPS resolver. */
async function resolve(domain, type) {
  try {
    const data = await getJson(
      `https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=${type}`,
      { headers: { Accept: 'application/dns-json' } },
    );
    return (data.Answer || [])
      .filter((a) => a.type !== 5 || type === 'CNAME')
      .map((a) => a.data);
  } catch {
    return [];
  }
}

/** Fetch RDAP (modern WHOIS) registration metadata. */
async function rdap(domain) {
  try {
    const data = await getJson(`https://rdap.org/domain/${encodeURIComponent(domain)}`, {
      timeoutMs: 15000,
    });
    const events = Object.fromEntries((data.events || []).map((e) => [e.eventAction, e.eventDate]));
    const registrar = (data.entities || []).find((e) => (e.roles || []).includes('registrar'));
    const registrarName = registrar?.vcardArray?.[1]?.find((f) => f[0] === 'fn')?.[3];
    return {
      registrar: registrarName,
      created: events.registration,
      updated: events['last changed'] || events['last update of RDAP database'],
      expires: events.expiration,
      status: data.status,
    };
  } catch {
    return null;
  }
}

export function registerDomain(bot) {
  bot.command('domain', async (ctx) => {
    const raw = (ctx.message.text.split(/\s+/)[1] || '').trim();
    if (!raw) {
      return ctx.replyWithHTML('Usage: <code>/domain example.com</code>');
    }
    const domain = normalizeDomain(raw);
    if (!isDomain(domain)) {
      return ctx.replyWithHTML('❌ That does not look like a valid domain.');
    }

    const progress = await ctx.replyWithHTML(`🌐 Resolving <b>${escapeHtml(domain)}</b>…`);

    const [records, whois] = await Promise.all([
      Promise.all(RECORD_TYPES.map(async (t) => [t, await resolve(domain, t)])),
      rdap(domain),
    ]);

    const lines = [`🌐 DNS &amp; registration for <b>${escapeHtml(domain)}</b>`, ''];

    for (const [type, values] of records) {
      if (!values.length) continue;
      const shown = values.slice(0, 8).map((v) => code(v)).join(', ');
      const extra = values.length > 8 ? ` (+${values.length - 8} more)` : '';
      lines.push(`<b>${type}:</b> ${shown}${extra}`);
    }

    if (whois) {
      lines.push('', '<b>Registration (RDAP)</b>');
      if (whois.registrar) lines.push(`• Registrar: ${escapeHtml(whois.registrar)}`);
      if (whois.created) lines.push(`• Created: ${code(whois.created.slice(0, 10))}`);
      if (whois.updated) lines.push(`• Updated: ${code(whois.updated.slice(0, 10))}`);
      if (whois.expires) lines.push(`• Expires: ${code(whois.expires.slice(0, 10))}`);
      if (whois.status?.length) lines.push(`• Status: ${escapeHtml(whois.status.join(', '))}`);
    }

    lines.push(
      '',
      `<b>Pivot:</b> ${link('crt.sh', `https://crt.sh/?q=${domain}`)} • ${link('Wayback', `https://web.archive.org/web/*/${domain}`)} • ${link('VirusTotal', `https://www.virustotal.com/gui/domain/${domain}`)} • ${link('urlscan', `https://urlscan.io/domain/${domain}`)}`,
      '',
      `<i>Tip: run</i> <code>/subdomains ${escapeHtml(domain)}</code>`,
    );

    await ctx.telegram.deleteMessage(progress.chat.id, progress.message_id).catch(() => {});
    return ctx.replyWithHTML(lines.join('\n'), { disable_web_page_preview: true });
  });
}
