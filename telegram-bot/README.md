# 🕵️ Awesome AI OSINT — Telegram Bot

A practical Telegram bot that puts the techniques curated in
[Awesome-AI-OSINT](../README.md) into action. It turns the "theory" list of AI
& OSINT methods into hands-on commands you can run from a chat — username
hunting, Google dork generation, subdomain enumeration, IP/domain recon,
image-geolocation (GEOINT) guidance, and an optional AI OSINT analyst.

> ⚖️ **Use responsibly and legally.** Every command queries only information
> that is already **publicly available** (DNS, certificate transparency logs,
> public profiles, search engines). Respect privacy and local laws.

---

## ✨ Commands

| Command | What it does | Data source |
|---|---|---|
| `/username <name>` | Checks a handle across 20+ platforms | Public profile pages |
| `/subdomains <domain>` | Passive subdomain enumeration | crt.sh + HackerTarget |
| `/domain <domain>` | DNS records (A/AAAA/MX/NS/TXT/CNAME/SOA) + RDAP/WHOIS summary | Google DoH + rdap.org |
| `/ip <ip>` | Geolocation, ASN, ISP, proxy/hosting flags + pivots | ip-api.com |
| `/headers <url>` | HTTP response headers (tech-stack fingerprinting) | Direct request |
| `/email <email>` | Format/MX validation + breach & search pivots | Google DoH + curated links |
| `/dork <target>` | Generates ready-to-run Google dorks | Local generator |
| `/geoint` | Image-geolocation workflow + copy-paste AI prompt | Curated guide |
| `/ai <question>` | AI OSINT analyst assistant *(optional)* | OpenAI-compatible API |
| `/help` | Show the help message | — |

---

## 🚀 Setup

### 1. Prerequisites
- Node.js **18+** (uses the native `fetch`)
- A Telegram bot token from [@BotFather](https://t.me/BotFather)

### 2. Install
```bash
cd telegram-bot
npm install
```

### 3. Configure
```bash
cp .env.example .env
```
Edit `.env`:

| Variable | Required | Description |
|---|---|---|
| `BOT_TOKEN` | ✅ | Token from @BotFather |
| `AI_API_KEY` | ❌ | Enables `/ai`. Any OpenAI-compatible key (OpenAI, OpenRouter, Groq, local LLM…) |
| `AI_BASE_URL` | ❌ | API base URL (default `https://api.openai.com/v1`) |
| `AI_MODEL` | ❌ | Model name (default `gpt-4o-mini`) |
| `ALLOWED_USER_IDS` | ❌ | Comma-separated Telegram user IDs allowed to use the bot. Empty = everyone |
| `USERNAME_SKIP` | ❌ | Comma-separated platform keys to skip in `/username` |
| `HTTP_TIMEOUT_MS` | ❌ | Per-request timeout (default `10000`) |

### 4. Run
```bash
npm start      # production
npm run dev    # auto-reload on file changes
```

---

## 🗂️ Project structure

```
telegram-bot/
├── src/
│   ├── index.js            # bootstrap & graceful shutdown
│   ├── bot.js              # Telegraf setup, access control, command menu
│   ├── config.js           # environment configuration
│   ├── utils/
│   │   ├── http.js         # fetch wrapper with timeout
│   │   ├── format.js       # Telegram HTML helpers & message chunking
│   │   └── validate.js     # domain / IP / email / username validators
│   └── commands/
│       ├── index.js        # command registry + "/" menu
│       ├── start.js        # /start, /help
│       ├── username.js     # /username
│       ├── subdomains.js   # /subdomains
│       ├── domain.js       # /domain
│       ├── ip.js           # /ip
│       ├── headers.js      # /headers
│       ├── email.js        # /email
│       ├── dork.js         # /dork
│       ├── geoint.js       # /geoint
│       └── ai.js           # /ai
├── .env.example
└── package.json
```

Adding a new command is a 3-step process: create `src/commands/<name>.js`
exporting a `register<Name>(bot)` function, register it in
`src/commands/index.js`, and add it to `COMMAND_MENU`.

---

## 🔒 Notes & limitations
- `/username` is heuristic: a "present" result means the profile page exists,
  but the same handle can belong to different people — always verify manually.
- `crt.sh` is occasionally rate-limited/overloaded; the bot automatically
  retries and falls back to HackerTarget for subdomain data.
- No API keys are required for any command except `/ai`.

## 📄 License
MIT
