import { useCallback, useEffect, useState } from 'react';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { api } from './api.js';
import { quantityIn, tidyBasket } from './helpers.js';
import { loadState, saveState } from './storage.js';

import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';

import Home from './pages/Home.jsx';
import Books from './pages/Books.jsx';
import BookDetail from './pages/BookDetail.jsx';
import Basket from './pages/Basket.jsx';
import Login from './pages/Login.jsx';
import Manage from './pages/Manage.jsx';
import Contact from './pages/Contact.jsx';
import { About, NotFound } from './pages/Info.jsx';

// Keys used to save the basket and budget in this browser.
const BASKET_KEY = 'bookshop.basket';
const BUDGET_KEY = 'bookshop.budget';

// App keeps the shared data and decides which page is shown.
// - Books come from the server.
// - The basket and budget are saved in this browser, so a refresh keeps them.
// - The admin session comes from a cookie that the server sets when you log in.
export default function App() {
  const navigate = useNavigate();

  const [books, setBooks] = useState([]);
  const [booksReady, setBooksReady] = useState(false);
  const [loadError, setLoadError] = useState('');

  const [basket, setBasket] = useState(() => loadState(BASKET_KEY, []));
  const [budget, setBudget] = useState(() => loadState(BUDGET_KEY, '1000'));

  const [admin, setAdmin] = useState(null);
  const [sessionChecked, setSessionChecked] = useState(false);

  useEffect(() => {
    saveState(BASKET_KEY, basket);
  }, [basket]);

  useEffect(() => {
    saveState(BUDGET_KEY, budget);
  }, [budget]);

  // Loads the catalogue. The basket is only tidied after a successful load,
  // so a failed request can never empty it.
  const loadBooks = useCallback(async () => {
    try {
      const list = await api.getBooks();
      setBooks(list);
      setBasket((current) => tidyBasket(current, list));
      setLoadError('');
    } catch (error) {
      setLoadError(error.message);
    } finally {
      setBooksReady(true);
    }
  }, []);

  useEffect(() => {
    loadBooks();
  }, [loadBooks]);

  // Checks whether this browser has an admin session (for example after a refresh).
  useEffect(() => {
    api
      .me()
      .then((data) => setAdmin(data.admin))
      .catch(() => setAdmin(null))
      .finally(() => setSessionChecked(true));
  }, []);

  // Count all copies currently in the basket.
  const basketCount = basket.reduce((total, item) => total + item.quantity, 0);

  // Add one copy of a book to the basket. Returns an error message, or '' when it worked.
  function addToBasket(bookId) {
    const book = books.find((item) => item.id === bookId);

    if (!book || book.copies === 0) {
      return 'This book is not available right now.';
    }

    const currentQuantity = quantityIn(basket, bookId);

    if (currentQuantity >= book.copies) {
      return `Only ${book.copies} copies are available.`;
    }

    if (currentQuantity === 0) {
      setBasket([...basket, { bookId, quantity: 1 }]);
    } else {
      setBasket(
        basket.map((item) => (item.bookId === bookId ? { ...item, quantity: item.quantity + 1 } : item))
      );
    }

    return '';
  }

  // Change the number of copies of a book, keeping it between 1 and the stock.
  function changeQuantity(bookId, quantity) {
    const book = books.find((item) => item.id === bookId);
    if (!book) return;

    const safeQuantity = Math.max(1, Math.min(quantity, book.copies));
    setBasket(basket.map((item) => (item.bookId === bookId ? { ...item, quantity: safeQuantity } : item)));
  }

  function removeFromBasket(bookId) {
    setBasket(basket.filter((item) => item.bookId !== bookId));
  }

  function resetBasket() {
    setBasket([]);
  }

  async function login(username, password) {
    const data = await api.login(username, password);
    setAdmin(data.admin);
  }

  async function logout() {
    await api.logout().catch(() => {});
    setAdmin(null);
    navigate('/');
  }

  // The Manage page is only shown to a logged-in admin. Everyone else goes to the login page.
  function renderManage() {
    if (!sessionChecked) return <p className="muted">Checking admin login…</p>;
    if (!admin) return <Navigate to="/login" replace />;
    return <Manage books={books} onChanged={loadBooks} />;
  }

  return (
    <div className="app">
      <Navbar basketCount={basketCount} isAdmin={Boolean(admin)} onLogout={logout} />

      <main className="container">
        {loadError && (
          <div className="notice notice-error" role="alert">
            <p>Could not load the books: {loadError}</p>
            <button type="button" className="btn btn-ghost btn-sm" onClick={loadBooks}>
              Try again
            </button>
          </div>
        )}

        {!booksReady ? (
          <p className="muted" role="status">
            Loading books…
          </p>
        ) : (
          <Routes>
            <Route path="/" element={<Home books={books} basket={basket} onAdd={addToBasket} />} />

            <Route path="/books" element={<Books books={books} basket={basket} onAdd={addToBasket} />} />

            <Route
              path="/books/:bookId"
              element={<BookDetail books={books} basket={basket} onAdd={addToBasket} />}
            />

            <Route
              path="/basket"
              element={
                <Basket
                  books={books}
                  basket={basket}
                  budget={budget}
                  onBudgetChange={setBudget}
                  onChange={changeQuantity}
                  onRemove={removeFromBasket}
                  onReset={resetBasket}
                />
              }
            />

            <Route
              path="/login"
              element={admin ? <Navigate to="/manage" replace /> : <Login onLogin={login} />}
            />

            <Route path="/manage" element={renderManage()} />

            <Route path="/contact" element={<Contact books={books} />} />
            <Route path="/about" element={<About />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        )}
      </main>

      <Footer />
    </div>
  );
}
