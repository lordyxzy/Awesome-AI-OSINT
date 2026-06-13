import { config } from '../config.js';

const HELP = `<b>🕵️ Awesome AI OSINT Bot</b>

A hands-on companion for the techniques curated in the <i>Awesome-AI-OSINT</i> repo.
All lookups use <b>public, open sources</b> only.

<b>Reconnaissance</b>
/username <code>&lt;name&gt;</code> — check a handle across many platforms
/subdomains <code>&lt;domain&gt;</code> — passive subdomain enumeration (crt.sh)
/domain <code>&lt;domain&gt;</code> — DNS records + WHOIS-style summary
/ip <code>&lt;ip&gt;</code> — geolocation, ASN and network owner
/headers <code>&lt;url&gt;</code> — inspect HTTP response headers
/email <code>&lt;email&gt;</code> — validate &amp; pivot points for an address

<b>Tradecraft helpers</b>
/dork <code>&lt;target&gt;</code> — generate ready-to-use Google dorks
/geoint — image geolocation workflow &amp; AI prompt
/ai <code>&lt;question&gt;</code> — AI OSINT analyst assistant${config.ai.enabled ? '' : ' <i>(disabled — no API key)</i>'}

<b>Other</b>
/help — show this message

<i>⚖️ Use responsibly and legally. This tool only queries information that is already publicly available.</i>`;

export function registerStart(bot) {
  bot.start((ctx) => ctx.replyWithHTML(HELP, { disable_web_page_preview: true }));
  bot.help((ctx) => ctx.replyWithHTML(HELP, { disable_web_page_preview: true }));
}

export { HELP };
