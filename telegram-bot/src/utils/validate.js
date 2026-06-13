const DOMAIN_RE = /^(?=.{1,253}$)(?!-)[a-z0-9-]{1,63}(?<!-)(\.[a-z0-9-]{1,63})+$/i;
const IPV4_RE = /^(25[0-5]|2[0-4]\d|1?\d?\d)(\.(25[0-5]|2[0-4]\d|1?\d?\d)){3}$/;
const EMAIL_RE = /^[^\s@]+@([^\s@]+\.[^\s@]+)$/;
const USERNAME_RE = /^[a-z0-9._-]{2,32}$/i;

/** Strip protocol, path and whitespace to get a bare hostname. */
export function normalizeDomain(input = '') {
  let value = input.trim().toLowerCase();
  value = value.replace(/^https?:\/\//, '');
  value = value.replace(/^www\./, '');
  value = value.split('/')[0].split('?')[0].split('#')[0];
  value = value.split(':')[0];
  return value;
}

export function isDomain(value) {
  return DOMAIN_RE.test(value);
}

export function isIp(value) {
  return IPV4_RE.test(value);
}

export function isEmail(value) {
  return EMAIL_RE.test(value);
}

export function emailDomain(value) {
  const match = EMAIL_RE.exec(value);
  return match ? match[1].toLowerCase() : null;
}

export function isUsername(value) {
  return USERNAME_RE.test(value);
}

/** Ensure a URL has a protocol. */
export function ensureUrl(value = '') {
  const trimmed = value.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}
