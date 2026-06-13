import { assertConfig, config } from './config.js';
import { createBot, setupCommandMenu } from './bot.js';

async function main() {
  assertConfig();

  const bot = createBot();
  await setupCommandMenu(bot);

  process.once('SIGINT', () => bot.stop('SIGINT'));
  process.once('SIGTERM', () => bot.stop('SIGTERM'));

  console.log('🕵️  Awesome AI OSINT bot is starting…');
  console.log(`    AI assistant: ${config.ai.enabled ? `enabled (${config.ai.model})` : 'disabled'}`);
  console.log(
    `    Access control: ${config.allowedUserIds.length ? `${config.allowedUserIds.length} allowed user(s)` : 'open to everyone'}`,
  );

  // Note: in Telegraf this promise resolves only after the bot stops.
  await bot.launch();
}

main().catch((err) => {
  console.error('Fatal:', err.message);
  process.exit(1);
});
