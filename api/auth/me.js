import { getSession } from '../../server/auth.js';
import { handle, methodNotAllowed } from '../../server/http.js';

// Tells the browser whether the visitor is a logged-in admin (used after a page refresh).
export default handle(async (req, res) => {
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);
  const session = getSession(req);
  return res.status(200).json({ admin: session ? { username: session.username } : null });
});
