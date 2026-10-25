import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Cover from '../components/Cover.jsx';
import { formatPrice, genreLabel, quantityIn } from '../helpers.js';

export default function BookDetail({ books, basket, onAdd }) {
  const { bookId } = useParams(); // the id from the address, e.g. b06
  const [notice, setNotice] = useState('');

  const book = books.find((b) => b.id === bookId);

  if (!book) {
    return (
      <section className="narrow">
        <h1>Book not found</h1>
        <p>This book is not in the catalogue. It may have been deleted.</p>
        <Link to="/books" className="btn">
          Back to books
        </Link>
      </section>
    );
  }

  // Every edition with the same title (for example paperback and eBook).
  const editions = books.filter((b) => b.title === book.title);
  const inBasket = quantityIn(basket, book.id);

  function handleAdd() {
    setNotice(onAdd(book.id) || `Added ${book.title} (${book.format}) to your basket.`);
  }

  return (
    <section>
      <p className="crumbs">
        <Link to="/books">Books</Link> / {book.title}
      </p>

      <div className="details">
        <Cover book={book} alt={`Cover of ${book.title}, ${book.format} edition`} />

        <div>
          <p className="kicker">{genreLabel(book.genre)}</p>
          <h1>{book.title}</h1>
          <p className="author">by {book.author}</p>
          <p className="price big">{formatPrice(book.priceAFN)}</p>
          <p>
            <strong>Format:</strong> {book.format} · <strong>Copies left:</strong> {book.copies}
          </p>
          <p>{book.description}</p>

          {notice && <p className="notice" role="status">{notice}</p>}

          <div className="actions">
            {book.copies > 0 ? (
              <button type="button" className="btn" onClick={handleAdd}>
                Add to basket
              </button>
            ) : (
              <Link to={`/contact?book=${book.id}`} className="btn">
                Request this title
              </Link>
            )}
            {inBasket > 0 && <span className="muted">You have {inBasket} in your basket.</span>}
          </div>
        </div>
      </div>

      <section className="panel">
        <h2>Compare editions</h2>
        <p className="muted">Each edition has its own price and stock.</p>
        <div className="table-wrap">
          <table className="book-table">
            <caption>Editions of {book.title}</caption>
            <thead>
              <tr>
                <th scope="col">Format</th>
                <th scope="col">Price</th>
                <th scope="col">Copies left</th>
              </tr>
            </thead>
            <tbody>
              {editions.map((edition) => (
                <tr key={edition.id} aria-current={edition.id === book.id ? 'true' : undefined}>
                  <td>
                    <Link to={`/books/${edition.id}`}>{edition.format}</Link>
                    {edition.id === book.id && <span className="muted"> (this one)</span>}
                  </td>
                  <td>{formatPrice(edition.priceAFN)}</td>
                  <td>{edition.copies}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
}
