import { config } from '../config.js';

const DEFAULT_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
  Accept: 'text/html,application/json,*/*',
};

/**
 * fetch wrapper with a timeout and sane default headers.
 * @param {string} url
 * @param {RequestInit & { timeoutMs?: number }} [options]
 */
export async function request(url, options = {}) {
  const { timeoutMs = config.httpTimeoutMs, headers, ...rest } = options;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      redirect: 'follow',
      signal: controller.signal,
      headers: { ...DEFAULT_HEADERS, ...headers },
      ...rest,
    });
  } finally {
    clearTimeout(timer);
  }
}

/** Fetch and parse JSON, throwing on non-2xx responses. */
export async function getJson(url, options = {}) {
  const res = await request(url, options);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} for ${url}`);
  }
  return res.json();
}
