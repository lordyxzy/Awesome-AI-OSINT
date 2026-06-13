import 'dotenv/config';

function parseList(value) {
  return (value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

export const config = {
  botToken: process.env.BOT_TOKEN || '',
  ai: {
    apiKey: process.env.AI_API_KEY || '',
    baseUrl: (process.env.AI_BASE_URL || 'https://api.openai.com/v1').replace(/\/$/, ''),
    model: process.env.AI_MODEL || 'gpt-4o-mini',
    get enabled() {
      return Boolean(this.apiKey);
    },
  },
  allowedUserIds: parseList(process.env.ALLOWED_USER_IDS).map(Number).filter((n) => !Number.isNaN(n)),
  usernameSkip: parseList(process.env.USERNAME_SKIP),
  httpTimeoutMs: Number(process.env.HTTP_TIMEOUT_MS || 10000),
};

export function assertConfig() {
  if (!config.botToken) {
    throw new Error('BOT_TOKEN is missing. Copy .env.example to .env and set BOT_TOKEN.');
  }
}
