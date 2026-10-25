import { Link } from 'react-router-dom';

// The footer at the bottom of every page: about text, site links, and the copyright line.
export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-about">
          <p className="footer-brand">
            Bookshop <span>Reading Basket</span>
          </p>
          <p>Compare editions, build a reading basket and check it against your budget. Prices are in AFN.</p>
        </div>

        <nav className="footer-nav" aria-label="Footer menu">
          <p className="footer-title">Explore</p>
          <Link to="/">Home</Link>
          <Link to="/books">Books</Link>
          <Link to="/basket">Basket</Link>
          <Link to="/about">About</Link>
          <Link to="/contact">Contact</Link>
        </nav>

        <div className="footer-nav">
          <p className="footer-title">Account</p>
          <Link to="/login">Admin login</Link>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© {year} Bookshop Reading Basket. A course project.</p>
        <p>Book covers from Open Library. Prices and stock are sample values.</p>
      </div>
    </footer>
  );
}
