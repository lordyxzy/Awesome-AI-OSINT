import { Telegraf } from 'telegraf';
import { config } from './config.js';
import { registerCommands, COMMAND_MENU } from './commands/index.js';

export function createBot() {
  const bot = new Telegraf(config.botToken);

  // Optional allow-list access control.
  if (config.allowedUserIds.length) {
    bot.use((ctx, next) => {
      const userId = ctx.from?.id;
      if (userId && config.allowedUserIds.includes(userId)) return next();
      return ctx.reply('⛔ You are not authorized to use this bot.');
    });
  }

  registerCommands(bot);

  // Friendly fallback for unknown commands / plain text.
  bot.on('text', (ctx) => {
    if (ctx.message.text.startsWith('/')) {
      return ctx.reply('Unknown command. Send /help to see what I can do.');
    }
    return ctx.reply('Send /help to see the available OSINT commands.');
  });

  bot.catch((err, ctx) => {
    console.error(`Error while handling update ${ctx.update?.update_id}:`, err);
  });

  return bot;
}

export async function setupCommandMenu(bot) {
  try {
    await bot.telegram.setMyCommands(COMMAND_MENU);
  } catch (err) {
    console.warn('Could not set command menu:', err.message);
  }
}
