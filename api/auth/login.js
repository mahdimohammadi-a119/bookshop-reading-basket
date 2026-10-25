import { checkCredentials, createSessionToken, setSessionCookie } from '../../server/auth.js';
import { handle, methodNotAllowed } from '../../server/http.js';

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export default handle(async (req, res) => {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);

  const { username = '', password = '' } = req.body || {};

  if (!checkCredentials(String(username).trim(), String(password))) {
    // A short pause makes guessing passwords slower.
    await wait(500);
    return res.status(401).json({ error: 'Wrong username or password.' });
  }

  setSessionCookie(res, createSessionToken());
  return res.status(200).json({ admin: { username: String(username).trim() } });
});
