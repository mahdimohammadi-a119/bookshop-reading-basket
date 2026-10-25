import { coverFromIsbn } from '../shared/catalog.js';

// Real books with real ISBNs. Prices (in AFN) and stock numbers are sample values for the course.
// Covers are loaded from Open Library using the ISBN.
const BOOKS = [
  { id: 'b01', title: 'The Kite Runner', author: 'Khaled Hosseini', genre: 'fiction', format: 'Paperback', priceAFN: 480, copies: 6, isbn: '9781594631931', description: 'A novel about friendship, guilt and redemption, set between Kabul and California.' },
  { id: 'b02', title: 'A Thousand Splendid Suns', author: 'Khaled Hosseini', genre: 'fiction', format: 'Paperback', priceAFN: 470, copies: 4, isbn: '9781594480003', description: 'Two women in Afghanistan whose lives are shaped by war and family over several decades.' },
  { id: 'b03', title: 'The Little Prince', author: 'Antoine de Saint-Exupéry', genre: 'fiction', format: 'Paperback', priceAFN: 320, copies: 9, isbn: '9780156012195', description: 'A pilot stranded in the desert meets a young prince who has travelled between small planets.' },
  { id: 'b04', title: '1984', author: 'George Orwell', genre: 'fiction', format: 'Paperback', priceAFN: 380, copies: 5, isbn: '9780451524935', description: 'A dystopian novel about a state that watches and controls every citizen.' },
  { id: 'b05', title: 'To Kill a Mockingbird', author: 'Harper Lee', genre: 'fiction', format: 'Paperback', priceAFN: 420, copies: 0, isbn: '9780061120084', description: 'A girl in Alabama watches her lawyer father defend a man wrongly accused of a crime.' },
  { id: 'b06', title: 'The Alchemist', author: 'Paulo Coelho', genre: 'fiction', format: 'Paperback', priceAFN: 350, copies: 7, isbn: '9780062315007', description: 'A shepherd sets out to find a treasure near the Egyptian pyramids.' },
  { id: 'b07', title: 'Clean Code', author: 'Robert C. Martin', genre: 'technology', format: 'Paperback', priceAFN: 900, copies: 3, isbn: '9780132350884', description: 'Practical advice on writing readable, maintainable code, with worked examples.' },
  { id: 'b08', title: 'Eloquent JavaScript', author: 'Marijn Haverbeke', genre: 'technology', format: 'Paperback', priceAFN: 650, copies: 5, isbn: '9781593279509', description: 'An introduction to programming and JavaScript, with exercises and small projects.' },
  { id: 'b09', title: 'The Pragmatic Programmer', author: 'David Thomas, Andrew Hunt', genre: 'technology', format: 'Paperback', priceAFN: 850, copies: 2, isbn: '9780135957059', description: 'Advice on software craftsmanship, from everyday habits to working in teams.' },
  { id: 'b10', title: 'Pro Git', author: 'Scott Chacon, Ben Straub', genre: 'technology', format: 'Paperback', priceAFN: 700, copies: 4, isbn: '9781484200773', description: 'A complete guide to Git, from basic commands to how it works inside.' },
  { id: 'b11', title: 'Think Python', author: 'Allen B. Downey', genre: 'technology', format: 'Paperback', priceAFN: 500, copies: 0, isbn: '9781491939369', description: 'An introduction to Python programming for beginners, with exercises in every chapter.' },
  { id: 'b12', title: 'English Grammar in Use', author: 'Raymond Murphy', genre: 'languages', format: 'Paperback', priceAFN: 550, copies: 8, isbn: '9781316628683', description: 'A self-study grammar with clear units, exercises and an answer key.' },
];

export const SEED_BOOKS = BOOKS.map((book) => ({ ...book, coverUrl: coverFromIsbn(book.isbn) }));
