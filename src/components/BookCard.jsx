import { Link } from 'react-router-dom';
import { formatPrice, genreLabel } from '../helpers.js';
import Cover from './Cover.jsx';

// One book card. The card shows the book. The button sends the book id to the parent.
export default function BookCard({ book, inBasket, onAdd }) {
  const inStock = book.copies > 0;

  return (
    <article className="book-card">
      <Link to={`/books/${book.id}`}>
        <Cover book={book} />
      </Link>

      <p className="kicker">
        {genreLabel(book.genre)} · {book.format}
      </p>
      <h3>
        <Link to={`/books/${book.id}`}>{book.title}</Link>
      </h3>
      <p className="author">by {book.author}</p>

      <div className="price-row">
        <span className="price">{formatPrice(book.priceAFN)}</span>
        <span className={inStock ? 'stock' : 'stock out'}>{inStock ? `${book.copies} left` : 'Unavailable'}</span>
      </div>

      {inBasket > 0 && <p className="in-basket">In your basket: {inBasket}</p>}

      <button type="button" className="btn" disabled={!inStock} onClick={() => onAdd(book.id)}>
        Add to basket
      </button>
    </article>
  );
}
