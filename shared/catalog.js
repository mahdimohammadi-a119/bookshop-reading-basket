// Rules shared by the server and the browser.
// The server uses cleanBook() to check every book it receives.

export const GENRES = [
  { value: 'fiction', label: 'Fiction' },
  { value: 'technology', label: 'Technology' },
  { value: 'languages', label: 'Languages' },
];

export const FORMATS = ['Paperback', 'Hardcover', 'eBook'];

const MAX_DESCRIPTION = 500;

// Cover pictures come from Open Library, looked up by ISBN.
// default=false makes a missing cover return an error, so the app shows its fallback picture.
export function coverFromIsbn(isbn) {
  return `https://covers.openlibrary.org/b/isbn/${isbn}-M.jpg?default=false`;
}

// Checks the ISBN-13 check digit. Returns true when the 13 digits are valid.
export function isValidIsbn13(digits) {
  if (!/^\d{13}$/.test(digits)) return false;
  let sum = 0;
  for (let i = 0; i < 12; i += 1) {
    sum += Number(digits[i]) * (i % 2 === 0 ? 1 : 3);
  }
  const check = (10 - (sum % 10)) % 10;
  return check === Number(digits[12]);
}

// Checks and cleans the data for one book.
// Returns { errors, book }. Only use `book` when `errors` is empty.
export function cleanBook(input = {}) {
  const errors = {};
  const text = (value) => String(value ?? '').trim();
  const whole = (value) => {
    const cleaned = text(value);
    return cleaned === '' ? NaN : Number(cleaned);
  };

  const title = text(input.title);
  if (title.length < 2 || title.length > 150) errors.title = 'Title needs 2 to 150 characters.';

  const author = text(input.author);
  if (author.length < 2 || author.length > 100) errors.author = 'Author needs 2 to 100 characters.';

  const genre = text(input.genre);
  if (!GENRES.some((item) => item.value === genre)) errors.genre = 'Choose a genre from the list.';

  const format = text(input.format);
  if (!FORMATS.includes(format)) errors.format = 'Choose a format from the list.';

  const priceAFN = whole(input.priceAFN);
  if (!Number.isInteger(priceAFN) || priceAFN <= 0 || priceAFN > 100000) {
    errors.priceAFN = 'Price must be a whole number above 0 AFN.';
  }

  const copies = whole(input.copies);
  if (!Number.isInteger(copies) || copies < 0 || copies > 10000) {
    errors.copies = 'Copies must be a whole number, 0 or more.';
  }

  // Spaces and hyphens are allowed in the form, but they are removed before checking.
  const isbn = text(input.isbn).replace(/[\s-]/g, '');
  if (isbn !== '' && !isValidIsbn13(isbn)) {
    errors.isbn = 'ISBN must have 13 digits and a valid check digit. Leave it empty if you do not have one.';
  }

  let coverUrl = text(input.coverUrl);
  if (coverUrl !== '' && !coverUrl.startsWith('https://')) {
    errors.coverUrl = 'The cover link must start with https://';
  }
  if (coverUrl === '' && isbn !== '' && !errors.isbn) {
    coverUrl = coverFromIsbn(isbn);
  }

  const description = text(input.description) || 'No description yet.';
  if (description.length > MAX_DESCRIPTION) {
    errors.description = `Description is too long. The limit is ${MAX_DESCRIPTION} characters.`;
  }

  return {
    errors,
    book: { title, author, genre, format, priceAFN, copies, isbn, coverUrl, description },
  };
}
