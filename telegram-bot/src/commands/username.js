import { config } from '../config.js';
import { request } from '../utils/http.js';
import { isUsername } from '../utils/validate.js';
import { escapeHtml, link, replyLong } from '../utils/format.js';

/**
 * Each site is checked by requesting the profile URL.
 * `exists` decides whether the account is present, based on the
 * HTTP status and (optionally) text markers in the response body.
 */
const SITES = [
  { key: 'github', name: 'GitHub', url: (u) => `https://github.com/${u}` },
  { key: 'gitlab', name: 'GitLab', url: (u) => `https://gitlab.com/${u}` },
  { key: 'instagram', name: 'Instagram', url: (u) => `https://www.instagram.com/${u}/` },
  { key: 'x', name: 'X / Twitter', url: (u) => `https://twitter.com/${u}` },
  { key: 'reddit', name: 'Reddit', url: (u) => `https://www.reddit.com/user/${u}` },
  { key: 'telegram', name: 'Telegram', url: (u) => `https://t.me/${u}`, notFound: ['tgme_page_additional'] },
  { key: 'tiktok', name: 'TikTok', url: (u) => `https://www.tiktok.com/@${u}` },
  { key: 'youtube', name: 'YouTube', url: (u) => `https://www.youtube.com/@${u}` },
  { key: 'pinterest', name: 'Pinterest', url: (u) => `https://www.pinterest.com/${u}/` },
  { key: 'medium', name: 'Medium', url: (u) => `https://medium.com/@${u}` },
  { key: 'devto', name: 'DEV.to', url: (u) => `https://dev.to/${u}` },
  { key: 'dribbble', name: 'Dribbble', url: (u) => `https://dribbble.com/${u}` },
  { key: 'behance', name: 'Behance', url: (u) => `https://www.behance.net/${u}` },
  { key: 'steam', name: 'Steam', url: (u) => `https://steamcommunity.com/id/${u}` },
  { key: 'twitch', name: 'Twitch', url: (u) => `https://m.twitch.tv/${u}` },
  { key: 'soundcloud', name: 'SoundCloud', url: (u) => `https://soundcloud.com/${u}` },
  { key: 'spotify', name: 'Spotify', url: (u) => `https://open.spotify.com/user/${u}` },
  { key: 'patreon', name: 'Patreon', url: (u) => `https://www.patreon.com/${u}` },
  { key: 'keybase', name: 'Keybase', url: (u) => `https://keybase.io/${u}` },
  { key: 'replit', name: 'Replit', url: (u) => `https://replit.com/@${u}` },
  { key: 'hackernews', name: 'Hacker News', url: (u) => `https://news.ycombinator.com/user?id=${u}`, notFound: ['No such user.'] },
  { key: 'npm', name: 'npm', url: (u) => `https://www.npmjs.com/~${u}` },
  { key: 'vk', name: 'VK', url: (u) => `https://vk.com/${u}` },
];

async function checkSite(site, username) {
  const url = site.url(username);
  try {
    const res = await request(url, { redirect: 'follow' });
    if (res.status === 404 || res.status === 410) {
      return { site, url, status: 'free' };
    }
    if (res.status >= 200 && res.status < 300) {
      if (site.notFound?.length) {
        const body = await res.text();
        const missing = site.notFound.some((marker) => body.includes(marker));
        return { site, url, status: missing ? 'free' : 'found' };
      }
      return { site, url, status: 'found' };
    }
    return { site, url, status: 'unknown', code: res.status };
  } catch {
    return { site, url, status: 'error' };
  }
}

export function registerUsername(bot) {
  bot.command('username', async (ctx) => {
    const username = (ctx.message.text.split(/\s+/)[1] || '').trim();
    if (!username) {
      return ctx.replyWithHTML('Usage: <code>/username johndoe</code>');
    }
    if (!isUsername(username)) {
      return ctx.replyWithHTML('❌ Invalid username. Use 2–32 chars: letters, digits, <code>. _ -</code>');
    }

    const sites = SITES.filter((s) => !config.usernameSkip.includes(s.key));
    const progress = await ctx.replyWithHTML(
      `🔎 Searching <b>${escapeHtml(username)}</b> across ${sites.length} platforms…`,
    );

    const results = await Promise.all(sites.map((site) => checkSite(site, username)));
    const found = results.filter((r) => r.status === 'found');
    const inconclusive = results.filter((r) => r.status === 'unknown' || r.status === 'error');

    const lines = [`🕵️ Results for <b>${escapeHtml(username)}</b>`, ''];
    if (found.length) {
      lines.push(`<b>✅ Likely present (${found.length})</b>`);
      for (const r of found) lines.push(`• ${link(r.site.name, r.url)}`);
    } else {
      lines.push('No active profiles confirmed on the checked platforms.');
    }
    if (inconclusive.length) {
      lines.push('', `<b>⚠️ Inconclusive (${inconclusive.length})</b> — verify manually:`);
      for (const r of inconclusive) lines.push(`• ${link(r.site.name, r.url)}`);
    }
    lines.push(
      '',
      '<i>Heuristic check — confirm matches manually, the same handle may belong to different people.</i>',
    );

    await ctx.telegram
      .deleteMessage(progress.chat.id, progress.message_id)
      .catch(() => {});
    return replyLong(ctx, lines.join('\n'));
  });
}
