import crypto from 'crypto';

const ENC_ALGO = 'aes-256-gcm';

function getEncKey() {
  const raw = process.env.DEVOPS_TOTP_ENC_KEY || process.env.JWT_SECRET || 'devops-dev-key';
  return crypto.createHash('sha256').update(String(raw)).digest();
}

export function encryptSecret(plain) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ENC_ALGO, getEncKey(), iv);
  const enc = Buffer.concat([cipher.update(String(plain), 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString('base64')}:${tag.toString('base64')}:${enc.toString('base64')}`;
}

export function decryptSecret(payload) {
  const [ivB64, tagB64, dataB64] = String(payload).split(':');
  const decipher = crypto.createDecipheriv(ENC_ALGO, getEncKey(), Buffer.from(ivB64, 'base64'));
  decipher.setAuthTag(Buffer.from(tagB64, 'base64'));
  const dec = Buffer.concat([decipher.update(Buffer.from(dataB64, 'base64')), decipher.final()]);
  return dec.toString('utf8');
}

export function hashValue(value) {
  return crypto.createHash('sha256').update(String(value)).digest('hex');
}

export function hashIp(ip) {
  const salt = process.env.DEVOPS_IP_HASH_SALT || 'devops-ip';
  return hashValue(`${salt}:${ip || ''}`);
}

export function classifyApp(path = '') {
  const p = String(path).toLowerCase();
  if (p.includes('/devops')) return 'devops';
  if (p.includes('/b2b')) return 'b2b';
  if (p.includes('/b2c-admin') || p.includes('/admin')) return 'admin';
  if (p.includes('/b2c')) return 'b2c';
  return 'system';
}

export function shouldSampleRequest(status, durationMs) {
  if (status >= 500) return true;
  if (durationMs >= Number(process.env.DEVOPS_SLOW_MS || 2000)) return true;
  const rate = Number(process.env.DEVOPS_REQUEST_SAMPLE_RATE ?? 0.1);
  return Math.random() < rate;
}

export function parseAllowlist() {
  const raw = process.env.DEVOPS_IP_ALLOWLIST || '';
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

export function ipAllowed(ip) {
  const list = parseAllowlist();
  if (!list.length) return true;
  const normalized = String(ip || '').replace('::ffff:', '');
  return list.some((entry) => normalized === entry || normalized.startsWith(entry));
}

export function clientIp(req) {
  const xf = req.headers['x-forwarded-for'];
  if (typeof xf === 'string' && xf.length) return xf.split(',')[0].trim();
  return req.ip || req.socket?.remoteAddress || '';
}

export function fingerprintError(message, stack = '', route = '') {
  const top = String(stack || '')
    .split('\n')
    .slice(0, 4)
    .join('|');
  return hashValue(`${message}|${top}|${route}`).slice(0, 32);
}
