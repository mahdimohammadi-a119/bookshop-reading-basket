import { requireAdmin } from '../../server/auth.js';
import { listBooks, resetBooks } from '../../server/store.js';
import { handle, methodNotAllowed } from '../../server/http.js';

// POST /api/admin/reset -> put the sample books back (admin only)
export default handle(async (req, res) => {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);
  if (!requireAdmin(req, res)) return undefined;

  await resetBooks();
  const books = await listBooks();
  return res.status(200).json({ books });
});
