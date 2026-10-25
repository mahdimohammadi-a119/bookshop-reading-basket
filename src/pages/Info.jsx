import { Link } from 'react-router-dom';

export function About() {
  return (
    <section className="narrow">
      <header className="page-head">
        <h1>About this project</h1>
        <p>A small course project for planning a reading budget.</p>
      </header>

      <div className="panel">
        <h2>What you can do</h2>
        <ul>
          <li>Browse books, search, filter and sort them.</li>
          <li>Compare editions. Each format has its own price and stock.</li>
          <li>Build a basket and check the total against your budget.</li>
          <li>Send a sample request for a book that is out of stock.</li>
          <li>The admin can log in to add, edit or delete books.</li>
        </ul>
      </div>

      <div className="panel">
        <h2>How it works</h2>
        <p>Books are stored on the server, so every visitor sees the same catalogue.</p>
        <p>Your basket and budget are saved in your browser, so a page refresh keeps them.</p>
        <p>Prices and stock numbers are sample values. Covers are loaded from Open Library by ISBN.</p>
      </div>

      <Link to="/books" className="btn">
        Start browsing
      </Link>
    </section>
  );
}

export function NotFound() {
  return (
    <section className="narrow empty">
      <h1>Page not found</h1>
      <p>The page you asked for does not exist. Check the address, or go back home.</p>
      <Link to="/" className="btn">
        Go to the home page
      </Link>
    </section>
  );
}
