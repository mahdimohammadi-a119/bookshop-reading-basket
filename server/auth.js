import crypto from 'node:crypto';

const COOKIE_NAME = 'admin_session';
const SESSION_HOURS = 8;

// Admin login. Environment variables on Vercel win over these fallback values,
// so you can change the password in the Vercel dashboard without editing the code.
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@2026';

// Key used to sign the session cookie. If ADMIN_SECRET is not set, the password is used,
// so changing the password also logs out every current session.
const SIGNING_KEY = process.env.ADMIN_SECRET || `derived:${ADMIN_PASSWORD}`;

function sha256(text) {
  return crypto.createHash('sha256').update(text).digest();
}

// Compares two strings in constant time. Hashing first makes both sides the same length.
function sameText(a, b) {
  return crypto.timingSafeEqual(sha256(a), sha256(b));
}

export function checkCredentials(username, password) {
  // Both checks always run, so the timing does not show which part was wrong.
  const userMatches = sameText(username, ADMIN_USERNAME);
  const passwordMatches = sameText(password, ADMIN_PASSWORD);
  return userMatches && passwordMatches;
}

function sign(payload) {
  return crypto.createHmac('sha256', SIGNING_KEY).update(payload).digest('base64url');
}

export function createSessionToken() {
  const data = { sub: ADMIN_USERNAME, exp: Date.now() + SESSION_HOURS * 60 * 60 * 1000 };
  const payload = Buffer.from(JSON.stringify(data)).toString('base64url');
  return `${payload}.${sign(payload)}`;
}

function readCookie(req, name) {
  const header = req.headers.cookie || '';
  for (const part of header.split(';')) {
    const index = part.indexOf('=');
    if (index !== -1 && part.slice(0, index).trim() === name) {
      return part.slice(index + 1).trim();
    }
  }
  return null;
}

// Returns { username } for a valid admin session, or null when nobody is logged in.
export function getSession(req) {
  const token = readCookie(req, COOKIE_NAME);
  if (!token) return null;

  const [payload, signature] = token.split('.');
  if (!payload || !signature) return null;
  if (!sameText(signature, sign(payload))) return null;

  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    const valid = data.sub === ADMIN_USERNAME && typeof data.exp === 'number' && data.exp > Date.now();
    return valid ? { username: data.sub } : null;
  } catch {
    return null;
  }
}

// Answers 401 and returns null when the request is not from a logged-in admin.
export function requireAdmin(req, res) {
  const session = getSession(req);
  if (!session) {
    res.status(401).json({ error: 'Please log in as admin first.' });
    return null;
  }
  return session;
}

function cookieText(value, maxAgeSeconds) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  return `${COOKIE_NAME}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAgeSeconds}${secure}`;
}

export function setSessionCookie(res, token) {
  res.setHeader('Set-Cookie', cookieText(token, SESSION_HOURS * 60 * 60));
}

export function clearSessionCookie(res) {
  res.setHeader('Set-Cookie', cookieText('', 0));
}
