import { requireAdmin } from '../../server/auth.js';
import { createBook, listBooks } from '../../server/store.js';
import { handle, invalidInput, methodNotAllowed } from '../../server/http.js';
import { cleanBook } from '../../shared/catalog.js';

// GET /api/books      -> everyone can read the catalogue
// POST /api/books     -> admin only, adds a book
export default handle(async (req, res) => {
  if (req.method === 'GET') {
    const books = await listBooks();
    return res.status(200).json({ books });
  }

  if (req.method === 'POST') {
    if (!requireAdmin(req, res)) return undefined;

    const { errors, book } = cleanBook(req.body || {});
    if (Object.keys(errors).length > 0) return invalidInput(res, errors);

    const created = await createBook(book);
    return res.status(201).json({ book: created });
  }

  return methodNotAllowed(res, ['GET', 'POST']);
});
