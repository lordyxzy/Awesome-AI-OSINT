import { escapeHtml, link, replyLong } from '../utils/format.js';

const google = (q) => `https://www.google.com/search?q=${encodeURIComponent(q)}`;

/** Categories of Google dorks, generated from the user's target term. */
function buildDorks(target) {
  const t = target.replace(/"/g, '');
  const isDomainLike = /\.[a-z]{2,}$/i.test(t) && !t.includes(' ');
  const quoted = `"${t}"`;

  const categories = [
    {
      title: '👤 People & profiles',
      dorks: [
        `${quoted} (site:linkedin.com OR site:facebook.com OR site:instagram.com)`,
        `${quoted} ("email" OR "contact" OR "phone")`,
        `${quoted} (intitle:"profile" OR intitle:"about")`,
        `${quoted} site:github.com`,
      ],
    },
    {
      title: '📄 Documents & leaks',
      dorks: [
        `${quoted} (filetype:pdf OR filetype:docx OR filetype:xlsx)`,
        `${quoted} (filetype:csv OR filetype:txt) ("password" OR "email")`,
        `${quoted} (intitle:"index of" OR "parent directory")`,
      ],
    },
    {
      title: '🔐 Exposed data',
      dorks: [
        `${quoted} ("api_key" OR "apikey" OR "secret" OR "token")`,
        `${quoted} site:pastebin.com OR site:ghostbin.com OR site:trello.com`,
        `${quoted} ext:env OR ext:log OR ext:sql`,
      ],
    },
    {
      title: '🌐 Mentions & social',
      dorks: [
        `${quoted} (site:reddit.com OR site:medium.com OR site:t.me)`,
        `${quoted} -site:wikipedia.org`,
        `intext:${quoted} after:2023-01-01`,
      ],
    },
  ];

  if (isDomainLike) {
    categories.unshift({
      title: '🏢 Domain footprint',
      dorks: [
        `site:${t}`,
        `site:${t} (inurl:admin OR inurl:login OR inurl:dashboard)`,
        `site:${t} (filetype:pdf OR filetype:xlsx OR filetype:docx)`,
        `site:${t} (intitle:"index of" OR "parent directory")`,
        `site:${t} ("confidential" OR "internal use only")`,
        `-site:${t} ${quoted}`,
      ],
    });
  }

  return categories;
}

export function registerDork(bot) {
  bot.command('dork', (ctx) => {
    const target = ctx.message.text.replace(/^\/dork(@\S+)?/, '').trim();
    if (!target) {
      return ctx.replyWithHTML(
        'Usage: <code>/dork example.com</code> or <code>/dork "John Smith"</code>',
      );
    }

    const categories = buildDorks(target);
    const lines = [`🔍 Google dorks for <b>${escapeHtml(target)}</b>`, ''];
    for (const cat of categories) {
      lines.push(`<b>${cat.title}</b>`);
      for (const d of cat.dorks) {
        lines.push(`<code>${escapeHtml(d)}</code>`);
        lines.push(`   ↳ ${link('run', google(d))}`);
      }
      lines.push('');
    }
    lines.push('<i>Tap a query to copy it, or use the “run” link to search directly.</i>');
    return replyLong(ctx, lines.join('\n'));
  });
}
