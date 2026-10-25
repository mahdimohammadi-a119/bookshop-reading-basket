import { GENRES } from './data.js';

// Shows a number with its unit, for example "1,200 AFN".
export function formatPrice(amount) {
  return `${amount.toLocaleString('en-US')} AFN`;
}

// Turns "technology" into "Technology".
export function genreLabel(value) {
  const genre = GENRES.find((item) => item.value === value);
  return genre ? genre.label : value;
}

// How many copies of one book are in the basket (0 if none).
export function quantityIn(basket, bookId) {
  const item = basket.find((entry) => entry.bookId === bookId);
  return item ? item.quantity : 0;
}

// The basket only stores { bookId, quantity }.
// This adds the book details to each row, so a price change shows up everywhere.
export function basketRows(basket, books) {
  const rows = [];
  for (const item of basket) {
    const book = books.find((b) => b.id === item.bookId);
    if (book) {
      rows.push({ ...book, quantity: item.quantity, lineTotal: book.priceAFN * item.quantity });
    }
  }
  return rows;
}

// Cleans a basket that was loaded from storage, or after the catalogue changed.
// Removes books that no longer exist and never allows more copies than are in stock.
export function tidyBasket(basket, books) {
  if (!Array.isArray(basket)) return [];

  return basket
    .filter((item) => item && typeof item.bookId === 'string' && Number.isInteger(item.quantity))
    .map((item) => {
      const book = books.find((b) => b.id === item.bookId);
      if (!book) return null;
      const quantity = Math.min(item.quantity, book.copies);
      return quantity > 0 ? { bookId: item.bookId, quantity } : null;
    })
    .filter(Boolean);
}

// Search, genre, "only available" and price sort, all at the same time.
export function filterBooks(books, { search, genre, onlyAvailable, sort }) {
  const term = search.trim().toLowerCase();

  const result = books.filter((book) => {
    const text = `${book.title} ${book.author}`.toLowerCase();
    return (
      text.includes(term) &&
      (genre === 'all' || book.genre === genre) &&
      (!onlyAvailable || book.copies > 0)
    );
  });

  if (sort === 'price-asc') result.sort((a, b) => a.priceAFN - b.priceAFN);
  if (sort === 'price-desc') result.sort((a, b) => b.priceAFN - a.priceAFN);
  return result;
}

// Turns input text into a number.
// Blank text gives NaN, so an empty box is never treated as 0.
export function toNumber(text) {
  return text.trim() === '' ? NaN : Number(text);
}

// Returns an error message for a bad budget, or '' if it is fine.
export function budgetError(text) {
  const amount = toNumber(text);
  if (isNaN(amount)) return 'Enter your budget as a number, for example 1000.';
  if (amount <= 0) return 'Budget must be more than 0 AFN.';
  return '';
}

export const MESSAGE_MAX = 300;

// Checks the contact form. Returns an object of errors (empty object = all good).
export function validateContact(form) {
  const errors = {};
  if (form.name.trim() === '') errors.name = 'Please enter your name.';

  const email = form.email.trim();
  if (email === '') {
    errors.email = 'Please enter your email address.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = 'This email does not look right. Example: name@example.com';
  }

  if (form.subject === '') errors.subject = 'Choose a subject.';
  if (form.subject === 'request' && form.bookId === '') {
    errors.bookId = 'Choose the unavailable title you want to ask about.';
  }

  const length = form.message.trim().length;
  if (length < 10) {
    errors.message = 'Message needs at least 10 characters.';
  } else if (length > MESSAGE_MAX) {
    errors.message = `Message is too long. The limit is ${MESSAGE_MAX} characters.`;
  }
  return errors;
}
