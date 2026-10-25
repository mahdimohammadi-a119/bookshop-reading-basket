import { Link } from 'react-router-dom';

// The main introduction shown at the top of the Home page.
export default function Hero() {
  return (
    <section className="hero">
      <div>
        <p className="kicker">Reading budget planner</p>
        <h1>Browse &amp; Select Books</h1>
        <p className="lead">
          Find books you like, compare prices, and see what fits your budget.
        </p>
        <Link to="/books" className="btn">
          Explore Now
        </Link>
      </div>

      <div className="hero-covers" aria-hidden="true">
        <img className="cover-left" src="/covers/languages.svg" alt="" />
        <img className="cover-center" src="/covers/fiction.svg" alt="" />
        <img className="cover-right" src="/covers/technology.svg" alt="" />
      </div>
    </section>
  );
}
