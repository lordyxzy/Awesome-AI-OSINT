import { config } from '../config.js';
import { request } from '../utils/http.js';
import { chunk } from '../utils/format.js';

const SYSTEM_PROMPT = `You are an expert OSINT (open-source intelligence) analyst assistant.
You help investigators plan and reason about investigations using ONLY publicly available, legal sources.
Be practical and structured: suggest search strategies, Google dorks, tools, pivot points and verification steps.
Refuse anything that requires illegal access, hacking, doxxing of private individuals for harm, or non-public data.
Always remind the user to verify findings and respect privacy/laws. Keep answers concise and actionable.`;

async function askAi(question) {
  const res = await request(`${config.ai.baseUrl}/chat/completions`, {
    method: 'POST',
    timeoutMs: 60000,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.ai.apiKey}`,
    },
    body: JSON.stringify({
      model: config.ai.model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: question },
      ],
      temperature: 0.3,
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`AI API HTTP ${res.status} ${detail.slice(0, 200)}`);
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim() || 'No response from the model.';
}

export function registerAi(bot) {
  bot.command('ai', async (ctx) => {
    const question = ctx.message.text.replace(/^\/ai(@\S+)?/, '').trim();
    if (!config.ai.enabled) {
      return ctx.reply(
        '🤖 The AI assistant is disabled. Set AI_API_KEY (and optionally AI_BASE_URL / AI_MODEL) in your .env to enable /ai.',
      );
    }
    if (!question) {
      return ctx.reply('Usage: /ai How do I investigate a phishing domain?');
    }

    await ctx.sendChatAction('typing');
    let answer;
    try {
      answer = await askAi(question);
    } catch (err) {
      return ctx.reply(`⚠️ AI request failed: ${err.message}`);
    }

    for (const part of chunk(answer)) {
      await ctx.reply(part, { disable_web_page_preview: true });
    }
  });
}
