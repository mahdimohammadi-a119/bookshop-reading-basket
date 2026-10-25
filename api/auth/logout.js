import { clearSessionCookie } from '../../server/auth.js';
import { handle, methodNotAllowed } from '../../server/http.js';

export default handle(async (req, res) => {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);
  clearSessionCookie(res);
  return res.status(200).json({ ok: true });
});
