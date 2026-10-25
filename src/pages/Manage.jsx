import { useState } from 'react';
import { api } from '../api.js';
import Field from '../components/Field.jsx';
import { FORMATS, GENRES } from '../data.js';
import { formatPrice, genreLabel } from '../helpers.js';

const EMPTY_FORM = {
  title: '',
  author: '',
  genre: 'fiction',
  format: 'Paperback',
  priceAFN: '',
  copies: '',
  isbn: '',
  coverUrl: '',
  description: '',
};

// Only shown to a logged-in admin (App.jsx checks this).
export default function Manage({ books, onChanged }) {
  // The id of the book being edited. null means we are adding a new book.
  const [editingId, setEditingId] = useState(null);
  const [notice, setNotice] = useState(null); // { text, isError }

  const editing = books.find((b) => b.id === editingId);

  // Throws an ApiError when the server rejects the book, so the form can show the reason.
  async function saveBook(form) {
    const saved = editing ? await api.updateBook(editing.id, form) : await api.createBook(form);
    await onChanged();
    setEditingId(null);
    setNotice({
      text: editing ? `Saved changes to "${saved.title}".` : `Added "${saved.title}" to the catalogue.`,
      isError: false,
    });
  }

  async function handleDelete(book) {
    if (!window.confirm(`Delete "${book.title}" (${book.format})?`)) return;

    try {
      await api.deleteBook(book.id);
      await onChanged();
      if (editingId === book.id) setEditingId(null);
      setNotice({ text: `Deleted "${book.title}" (${book.format}).`, isError: false });
    } catch (error) {
      setNotice({ text: error.message, isError: true });
    }
  }

  async function handleRestore() {
    if (!window.confirm('Put back the sample books? Your changes will be lost.')) return;

    try {
      await api.resetBooks();
      await onChanged();
      setEditingId(null);
      setNotice({ text: 'Sample books restored.', isError: false });
    } catch (error) {
      setNotice({ text: error.message, isError: true });
    }
  }

  return (
    <section>
      <header className="page-head">
        <h1>Manage books</h1>
        <p>Add, edit or delete books. Changes are saved on the server and seen by every visitor.</p>
      </header>

      {notice && (
        <p className={notice.isError ? 'notice notice-error' : 'notice'} role="status">
          {notice.text}
        </p>
      )}

      <section className="panel">
        <h2>{editing ? `Edit "${editing.title}"` : 'Add a new book'}</h2>
        {/* The key changes when we start or stop editing, so the form starts fresh. */}
        <BookForm
          key={editingId || 'new'}
          book={editing}
          onSave={saveBook}
          onCancel={() => setEditingId(null)}
        />
      </section>

      <section className="panel">
        <div className="panel-head">
          <h2>Catalogue ({books.length})</h2>
          <button type="button" className="btn btn-ghost btn-sm" onClick={handleRestore}>
            Restore sample books
          </button>
        </div>

        <div className="table-wrap">
          <table className="book-table">
            <caption>Every edition in the catalogue</caption>
            <thead>
              <tr>
                <th scope="col">Title</th>
                <th scope="col">Genre</th>
                <th scope="col">Format</th>
                <th scope="col">Price</th>
                <th scope="col">Copies</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {books.map((book) => (
                <tr key={book.id}>
                  <td>
                    {book.title}
                    <br />
                    <span className="muted">by {book.author}</span>
                    {book.isbn && (
                      <>
                        <br />
                        <span className="muted">ISBN {book.isbn}</span>
                      </>
                    )}
                  </td>
                  <td>{genreLabel(book.genre)}</td>
                  <td>{book.format}</td>
                  <td>{formatPrice(book.priceAFN)}</td>
                  <td>{book.copies}</td>
                  <td>
                    <div className="table-actions">
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => {
                          setEditingId(book.id);
                          setNotice(null);
                        }}
                      >
                        Edit
                      </button>
                      <button type="button" className="link-danger" onClick={() => handleDelete(book)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
}

// The form for adding a book, or for editing one when `book` is given.
function BookForm({ book, onSave, onCancel }) {
  const [form, setForm] = useState(
    book
      ? {
          ...EMPTY_FORM,
          title: book.title,
          author: book.author,
          genre: book.genre,
          format: book.format,
          priceAFN: String(book.priceAFN),
          copies: String(book.copies),
          isbn: book.isbn || '',
          coverUrl: book.coverUrl || '',
          description: book.description || '',
        }
      : EMPTY_FORM
  );
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  function change(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function submit(event) {
    event.preventDefault();

    setSaving(true);
    setErrors({});
    setFormError('');

    try {
      await onSave(form);
      // After adding, clear the form for the next book.
      if (!book) setForm(EMPTY_FORM);
    } catch (error) {
      setErrors(error.errors || {});
      setFormError(error.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} noValidate>
      {formError && (
        <p className="notice notice-error" role="alert">
          {formError}
        </p>
      )}

      <Field id="title" label="Title" error={errors.title}>
        <input id="title" name="title" value={form.title} onChange={change} />
      </Field>

      <Field id="author" label="Author" error={errors.author}>
        <input id="author" name="author" value={form.author} onChange={change} />
      </Field>

      <Field id="genre" label="Genre" error={errors.genre}>
        <select id="genre" name="genre" value={form.genre} onChange={change}>
          {GENRES.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </Field>

      <Field id="format" label="Format" error={errors.format}>
        <select id="format" name="format" value={form.format} onChange={change}>
          {FORMATS.map((format) => (
            <option key={format} value={format}>
              {format}
            </option>
          ))}
        </select>
      </Field>

      <Field id="priceAFN" label="Price (AFN)" error={errors.priceAFN}>
        <input id="priceAFN" name="priceAFN" type="number" min="1" step="1" value={form.priceAFN} onChange={change} />
      </Field>

      <Field id="copies" label="Copies in stock" error={errors.copies}>
        <input id="copies" name="copies" type="number" min="0" step="1" value={form.copies} onChange={change} />
      </Field>

      <Field id="isbn" label="ISBN-13 (optional)" error={errors.isbn}>
        <input id="isbn" name="isbn" inputMode="numeric" placeholder="For example 978-0132350884" value={form.isbn} onChange={change} />
      </Field>

      <Field id="coverUrl" label="Cover image link (optional)" error={errors.coverUrl}>
        <input id="coverUrl" name="coverUrl" placeholder="Leave empty to use the ISBN cover" value={form.coverUrl} onChange={change} />
      </Field>

      <Field id="description" label="Short description" error={errors.description}>
        <textarea id="description" name="description" value={form.description} onChange={change} />
      </Field>

      <div className="form-actions">
        <button type="submit" className="btn" disabled={saving}>
          {saving ? 'Saving…' : book ? 'Save changes' : 'Add book'}
        </button>
        {book && (
          <button type="button" className="btn btn-ghost" onClick={onCancel}>
            Cancel edit
          </button>
        )}
      </div>
    </form>
  );
}
