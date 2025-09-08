const DEFAULT_API = 'http://20.244.56.144/evaluation-service/logs';

const ALLOWED_STACKS = ['backend', 'frontend'];
const ALLOWED_LEVELS = ['debug', 'info', 'warn', 'error', 'fatal'];
const ALLOWED_PACKAGES = [
  "cache","controller","cron_job","db","domain","handler","repository","route","service",
  "auth","config","middleware","utils","api","hook","component","page","state","style"
];

function isLowerCase(s) {
  return s === s.toLowerCase();
}

function validateInputs(stack, level, pkg, message) {
  if (typeof stack !== 'string' || !isLowerCase(stack) || !ALLOWED_STACKS.includes(stack)) {
    throw new TypeError(`Invalid stack. Allowed (lowercase): ${ALLOWED_STACKS.join(', ')}`);
  }
  if (typeof level !== 'string' || !isLowerCase(level) || !ALLOWED_LEVELS.includes(level)) {
    throw new TypeError(`Invalid level. Allowed (lowercase): ${ALLOWED_LEVELS.join(', ')}`);
  }
  if (typeof pkg !== 'string' || !isLowerCase(pkg) || !ALLOWED_PACKAGES.includes(pkg)) {
    throw new TypeError(`Invalid package. Allowed (lowercase): ${ALLOWED_PACKAGES.join(', ')}`);
  }
  if (typeof message !== 'string') {
    throw new TypeError('Message must be a string');
  }
}

try {
  require('dotenv').config();
} catch (e) {
}

function resolveAuthTokenFromEnv() {
  if (typeof process !== 'undefined' && process.env) {
    return process.env.TOKEN ;
  }
  return null;
}

function timeoutPromise(promise, ms) {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('Request timed out')), ms);
    promise.then((v) => {
      clearTimeout(t);
      resolve(v);
    }, (err) => {
      clearTimeout(t);
      reject(err);
    });
  });
}

async function safeJson(res) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}
async function safeText(res) {
  try {
    return await res.text();
  } catch {
    return '';
  }
}

function getFetch() {
  if (typeof fetch !== 'undefined') return fetch;
  try {
    const nf = require('node-fetch');
    return nf.default || nf;
  } catch (e) {
    throw new Error('Global fetch not available and node-fetch is not installed. Install node-fetch or use Node 18+.');
  }
}

/**
 * Log function
 * @param {string} stack
 * @param {string} level
 * @param {string} pkg
 * @param {string} message
 * @param {Object} [opts]
 * @param {string} [opts.apiUrl]
 * @param {number} [opts.maxRetries]
 * @param {number} [opts.timeoutMs]
 */
async function Log(stack, level, pkg, message, opts = {}) {
  validateInputs(stack, level, pkg, message);

  const apiUrl = opts.apiUrl || DEFAULT_API;
  const maxRetries = typeof opts.maxRetries === 'number' ? opts.maxRetries : 2;
  const timeoutMs = typeof opts.timeoutMs === 'number' ? opts.timeoutMs : 8000;

  const token = resolveAuthTokenFromEnv();
  if (!token) {
    throw new Error('Auth token not found in environment. Set TOKEN, LOGGER_AUTH_TOKEN, or AUTH_TOKEN in your .env or environment.');
  }

  const body = { stack, level, package: pkg, message };

  const _fetch = getFetch();

  let attempt = 0;
  let lastErr = null;

  while (attempt <= maxRetries) {
    try {
      const resPromise = _fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const res = await timeoutPromise(resPromise, timeoutMs);

      if (!res.ok) {
        if (res.status >= 400 && res.status < 500) {
          const text = await safeText(res);
          throw new Error(`Logging API responded ${res.status}: ${text}`);
        }
        throw new Error(`Logging API responded ${res.status}`);
      }

      const data = await safeJson(res);
      return data || { message: 'log created (no body)' };
    } catch (err) {
      lastErr = err instanceof Error ? err : new Error(String(err));
      attempt += 1;
      if (attempt > maxRetries) break;
      const backoff = Math.min(1000 * Math.pow(2, attempt), 8000);
      const jitter = Math.floor(Math.random() * 200);
      await new Promise((r) => setTimeout(r, backoff + jitter));
    }
  }

  throw lastErr || new Error('Unknown logging error');
}

module.exports = { Log };
