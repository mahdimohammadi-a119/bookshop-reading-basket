import { requireAdmin } from '../../server/auth.js';
import { deleteBook, getBook, updateBook } from '../../server/store.js';
import { handle, invalidInput, methodNotAllowed } from '../../server/http.js';
import { cleanBook } from '../../shared/catalog.js';

const NOT_FOUND = 'This book is not in the catalogue. It may have been deleted.';

// GET    /api/books/:id  -> one book (everyone)
// PUT    /api/books/:id  -> change a book (admin only)
// DELETE /api/books/:id  -> remove a book (admin only)
export default handle(async (req, res) => {
  const id = String(req.query.id || '');

  if (req.method === 'GET') {
    const book = await getBook(id);
    if (!book) return res.status(404).json({ error: NOT_FOUND });
    return res.status(200).json({ book });
  }

  if (req.method === 'PUT') {
    if (!requireAdmin(req, res)) return undefined;

    const { errors, book } = cleanBook(req.body || {});
    if (Object.keys(errors).length > 0) return invalidInput(res, errors);

    const updated = await updateBook(id, book);
    if (!updated) return res.status(404).json({ error: NOT_FOUND });
    return res.status(200).json({ book: updated });
  }

  if (req.method === 'DELETE') {
    if (!requireAdmin(req, res)) return undefined;

    const removed = await deleteBook(id);
    if (!removed) return res.status(404).json({ error: NOT_FOUND });
    return res.status(200).json({ ok: true });
  }

  return methodNotAllowed(res, ['GET', 'PUT', 'DELETE']);
});
