import { useState } from 'react';
import BookCard from '../components/BookCard.jsx';
import Hero from '../components/Hero.jsx';
import { quantityIn } from '../helpers.js';

// Home shows the first four books of the catalogue as featured books.
const FEATURED_COUNT = 4;

export default function Home({ books, basket, onAdd }) {
  const [notice, setNotice] = useState('');

  const featuredBooks = books.slice(0, FEATURED_COUNT);

  function handleAdd(bookId) {
    const message = onAdd(bookId);
    setNotice(message || 'Added to your basket.');
  }

  return (
    <>
      <Hero />

      <section className="section">
        <h2 className="section-title">Featured Books</h2>

        {notice && (
          <p className="notice" role="status">
            {notice}
          </p>
        )}

        <div className="card-grid">
          {featuredBooks.map((book) => (
            <BookCard key={book.id} book={book} inBasket={quantityIn(basket, book.id)} onAdd={handleAdd} />
          ))}
        </div>
      </section>
    </>
  );
}
