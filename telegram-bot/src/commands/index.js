import { registerStart } from './start.js';
import { registerUsername } from './username.js';
import { registerDork } from './dork.js';
import { registerSubdomains } from './subdomains.js';
import { registerIp } from './ip.js';
import { registerDomain } from './domain.js';
import { registerEmail } from './email.js';
import { registerHeaders } from './headers.js';
import { registerGeoint } from './geoint.js';
import { registerAi } from './ai.js';

export function registerCommands(bot) {
  registerStart(bot);
  registerUsername(bot);
  registerDork(bot);
  registerSubdomains(bot);
  registerIp(bot);
  registerDomain(bot);
  registerEmail(bot);
  registerHeaders(bot);
  registerGeoint(bot);
  registerAi(bot);
}

/** Command list shown in the Telegram "/" menu. */
export const COMMAND_MENU = [
  { command: 'start', description: 'Show the help message' },
  { command: 'help', description: 'Show the help message' },
  { command: 'username', description: 'Search a username across platforms' },
  { command: 'subdomains', description: 'Enumerate subdomains (crt.sh)' },
  { command: 'domain', description: 'DNS records + WHOIS/RDAP summary' },
  { command: 'ip', description: 'IP geolocation, ASN & network owner' },
  { command: 'headers', description: 'Inspect HTTP response headers' },
  { command: 'email', description: 'Validate & pivot an email address' },
  { command: 'dork', description: 'Generate Google dorks for a target' },
  { command: 'geoint', description: 'Image geolocation workflow & prompt' },
  { command: 'ai', description: 'Ask the AI OSINT assistant' },
];
