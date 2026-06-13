import { getJson } from '../utils/http.js';
import { isIp } from '../utils/validate.js';
import { escapeHtml, code, link } from '../utils/format.js';

const FIELDS =
  'status,message,query,country,countryCode,regionName,city,zip,lat,lon,timezone,isp,org,as,asname,reverse,mobile,proxy,hosting';

/** IP geolocation & network info via the free ip-api.com endpoint. */
export function registerIp(bot) {
  bot.command('ip', async (ctx) => {
    const ip = (ctx.message.text.split(/\s+/)[1] || '').trim();
    if (!ip) {
      return ctx.replyWithHTML('Usage: <code>/ip 8.8.8.8</code>');
    }
    if (!isIp(ip)) {
      return ctx.replyWithHTML('❌ Please provide a valid IPv4 address.');
    }

    let data;
    try {
      data = await getJson(`http://ip-api.com/json/${ip}?fields=${FIELDS}`);
    } catch (err) {
      return ctx.replyWithHTML(`⚠️ Lookup failed: ${code(err.message)}`);
    }

    if (data.status !== 'success') {
      return ctx.replyWithHTML(`⚠️ ${escapeHtml(data.message || 'lookup failed')}`);
    }

    const flags = [
      data.mobile && '📱 mobile',
      data.proxy && '🛡️ proxy/VPN',
      data.hosting && '🖥️ hosting/datacenter',
    ].filter(Boolean);

    const lines = [
      `📍 IP intelligence for ${code(data.query)}`,
      '',
      `<b>Location:</b> ${escapeHtml([data.city, data.regionName, data.country].filter(Boolean).join(', '))} ${data.countryCode ? `(${escapeHtml(data.countryCode)})` : ''}`,
      `<b>Coords:</b> ${code(`${data.lat}, ${data.lon}`)} • ${link('map', `https://www.google.com/maps?q=${data.lat},${data.lon}`)}`,
      `<b>Timezone:</b> ${escapeHtml(data.timezone || '—')}`,
      `<b>ISP:</b> ${escapeHtml(data.isp || '—')}`,
      `<b>Org:</b> ${escapeHtml(data.org || '—')}`,
      `<b>ASN:</b> ${escapeHtml(data.as || '—')}${data.asname ? ` (${escapeHtml(data.asname)})` : ''}`,
      data.reverse ? `<b>rDNS:</b> ${code(data.reverse)}` : null,
      flags.length ? `<b>Flags:</b> ${flags.join(' • ')}` : null,
      '',
      `<b>Pivot:</b> ${link('Shodan', `https://www.shodan.io/host/${data.query}`)} • ${link('Censys', `https://search.censys.io/hosts/${data.query}`)} • ${link('VirusTotal', `https://www.virustotal.com/gui/ip-address/${data.query}`)}`,
    ].filter(Boolean);

    return ctx.replyWithHTML(lines.join('\n'), { disable_web_page_preview: true });
  });
}
