import { NavLink } from 'react-router-dom';

// The top menu. "Manage" and "Log out" only appear for a logged-in admin.
export default function Navbar({ basketCount, isAdmin, onLogout }) {
  function linkClass({ isActive }) {
    return isActive ? 'nav-link active' : 'nav-link';
  }

  return (
    <header className="site-header">
      <NavLink to="/" className="brand">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M4 5a2 2 0 0 1 2-2h12v16H6a2 2 0 0 0-2 2V5Zm2 0v12.2A4 4 0 0 1 6 17h10V3H6Z"
            fill="currentColor"
          />
        </svg>
        Bookshop <span>Reading Basket</span>
      </NavLink>

      <nav className="main-nav" aria-label="Main menu">
        <NavLink to="/" className={linkClass}>
          Home
        </NavLink>
        <NavLink to="/books" className={linkClass}>
          Books
        </NavLink>
        <NavLink to="/basket" className={linkClass}>
          Basket <span className="badge">{basketCount}</span>
        </NavLink>
        {isAdmin && (
          <NavLink to="/manage" className={linkClass}>
            Manage
          </NavLink>
        )}
        <NavLink to="/about" className={linkClass}>
          About
        </NavLink>
        <NavLink to="/contact" className={linkClass}>
          Contact
        </NavLink>
        {isAdmin && (
          <button type="button" className="nav-link nav-logout" onClick={onLogout}>
            Log out
          </button>
        )}
      </nav>
    </header>
  );
}
