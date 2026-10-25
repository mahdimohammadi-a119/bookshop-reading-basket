import { useState } from 'react';
import BookCard from '../components/BookCard.jsx';
import Field from '../components/Field.jsx';
import { GENRES } from '../data.js';
import { filterBooks, quantityIn } from '../helpers.js';

export default function Books({ books, basket, onAdd }) {
  // The filter values. The results on the screen depend on them.
  const [search, setSearch] = useState('');
  const [genre, setGenre] = useState('all');
  const [sort, setSort] = useState('none');
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [notice, setNotice] = useState('');

  // This runs on every screen update. It is fast enough for 14 books.
  const shown = filterBooks(books, { search, genre, onlyAvailable, sort });

  function resetFilters() {
    setSearch('');
    setGenre('all');
    setSort('none');
    setOnlyAvailable(false);
  }

  function handleAdd(bookId) {
    setNotice(onAdd(bookId) || 'Added to your basket.');
  }

  return (
    <section>
      <header className="page-head">
        <h1>Books</h1>
        <p>Search, filter and sort. Each edition has its own price and stock.</p>
      </header>

      <form className="filter-bar" role="search" onSubmit={(event) => event.preventDefault()}>
        <Field id="search" label="Search by title or author">
          <input id="search" type="search" placeholder="For example: React or Farid" value={search} onChange={(e) => setSearch(e.target.value)} />
        </Field>

        <Field id="genre" label="Genre">
          <select id="genre" value={genre} onChange={(e) => setGenre(e.target.value)}>
            <option value="all">All genres</option>
            {GENRES.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </Field>

        <Field id="sort" label="Sort by price">
          <select id="sort" value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="none">Default order</option>
            <option value="price-asc">Lowest first</option>
            <option value="price-desc">Highest first</option>
          </select>
        </Field>

        <label className="check">
          <input type="checkbox" checked={onlyAvailable} onChange={(e) => setOnlyAvailable(e.target.checked)} />
          Show only available books
        </label>

        <button type="button" className="btn btn-ghost" onClick={resetFilters}>
          Reset filters
        </button>
      </form>

      <p className="result-count" aria-live="polite">
        Showing {shown.length} of {books.length} books
      </p>
      {notice && <p className="notice" role="status">{notice}</p>}

      {shown.length === 0 ? (
        <div className="empty">
          <p>No books match these filters.</p>
          <button type="button" className="btn btn-ghost" onClick={resetFilters}>
            Reset filters
          </button>
        </div>
      ) : (
        <div className="card-grid">
          {shown.map((book) => (
            <BookCard key={book.id} book={book} inBasket={quantityIn(basket, book.id)} onAdd={handleAdd} />
          ))}
        </div>
      )}
    </section>
  );
}
