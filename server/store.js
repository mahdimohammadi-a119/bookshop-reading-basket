import crypto from 'node:crypto';
import pg from 'pg';
import { SEED_BOOKS } from './seed.js';

// On Vercel, connect a Postgres database (for example Neon from the Vercel Marketplace).
// That sets DATABASE_URL or POSTGRES_URL. Without either one, books are kept in memory
// and go back to the sample list each time the server restarts.
const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL || '';
const usePostgres = connectionString !== '';

if (!usePostgres) {
  console.warn('[store] No database URL found. Books are kept in memory only.');
}

function newId() {
  return `b${crypto.randomUUID().slice(0, 8)}`;
}

// ---------- Postgres ----------

let pool = null;

function db() {
  if (!pool) {
    // One connection is enough for a serverless function.
    pool = new pg.Pool({ connectionString, max: 1, idleTimeoutMillis: 5000 });
  }
  return pool;
}

const COLUMNS = 'id, title, author, genre, format, price_afn, copies, isbn, cover_url, description';
const INSERT_SQL = `INSERT INTO books (id, title, author, genre, format, price_afn, copies, isbn, cover_url, description)
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`;

function toRow(id, book) {
  return [id, book.title, book.author, book.genre, book.format, book.priceAFN, book.copies, book.isbn, book.coverUrl, book.description];
}

function fromRow(row) {
  return {
    id: row.id,
    title: row.title,
    author: row.author,
    genre: row.genre,
    format: row.format,
    priceAFN: row.price_afn,
    copies: row.copies,
    isbn: row.isbn,
    coverUrl: row.cover_url,
    description: row.description,
  };
}

async function insertSeedBooks() {
  for (const book of SEED_BOOKS) {
    await db().query(INSERT_SQL, toRow(book.id, book));
  }
}

const postgresRepo = {
  async init() {
    await db().query(`CREATE TABLE IF NOT EXISTS books (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      author TEXT NOT NULL,
      genre TEXT NOT NULL,
      format TEXT NOT NULL,
      price_afn INTEGER NOT NULL,
      copies INTEGER NOT NULL,
      isbn TEXT NOT NULL DEFAULT '',
      cover_url TEXT NOT NULL DEFAULT '',
      description TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
    )`);

    // A new, empty database gets the sample books the first time it is used.
    const { rows } = await db().query('SELECT COUNT(*)::int AS total FROM books');
    if (rows[0].total === 0) await insertSeedBooks();
  },

  async list() {
    const { rows } = await db().query(`SELECT ${COLUMNS} FROM books ORDER BY created_at, id`);
    return rows.map(fromRow);
  },

  async get(id) {
    const { rows } = await db().query(`SELECT ${COLUMNS} FROM books WHERE id = $1`, [id]);
    return rows[0] ? fromRow(rows[0]) : null;
  },

  async create(book) {
    const id = newId();
    await db().query(INSERT_SQL, toRow(id, book));
    return { id, ...book };
  },

  async update(id, book) {
    const result = await db().query(
      `UPDATE books SET title = $2, author = $3, genre = $4, format = $5, price_afn = $6,
        copies = $7, isbn = $8, cover_url = $9, description = $10 WHERE id = $1`,
      toRow(id, book)
    );
    return result.rowCount > 0 ? { id, ...book } : null;
  },

  async remove(id) {
    const result = await db().query('DELETE FROM books WHERE id = $1', [id]);
    return result.rowCount > 0;
  },

  async reset() {
    await db().query('DELETE FROM books');
    await insertSeedBooks();
  },
};

// ---------- Memory (used when there is no database) ----------

let memoryBooks = structuredClone(SEED_BOOKS);

const memoryRepo = {
  async list() {
    return structuredClone(memoryBooks);
  },

  async get(id) {
    const book = memoryBooks.find((item) => item.id === id);
    return book ? structuredClone(book) : null;
  },

  async create(book) {
    const created = { id: newId(), ...book };
    memoryBooks.push(created);
    return structuredClone(created);
  },

  async update(id, book) {
    const index = memoryBooks.findIndex((item) => item.id === id);
    if (index === -1) return null;
    memoryBooks[index] = { id, ...book };
    return structuredClone(memoryBooks[index]);
  },

  async remove(id) {
    const before = memoryBooks.length;
    memoryBooks = memoryBooks.filter((item) => item.id !== id);
    return memoryBooks.length !== before;
  },

  async reset() {
    memoryBooks = structuredClone(SEED_BOOKS);
  },
};

// ---------- Public functions used by the API ----------

const repo = usePostgres ? postgresRepo : memoryRepo;

let ready = null;

// Runs the setup once (create the table, add sample books). If it fails, it can be tried again later.
function ensureReady() {
  if (!ready) {
    ready = (repo.init ? repo.init() : Promise.resolve()).catch((error) => {
      ready = null;
      throw error;
    });
  }
  return ready;
}

export async function listBooks() {
  await ensureReady();
  return repo.list();
}

export async function getBook(id) {
  await ensureReady();
  return repo.get(id);
}

export async function createBook(book) {
  await ensureReady();
  return repo.create(book);
}

export async function updateBook(id, book) {
  await ensureReady();
  return repo.update(id, book);
}

export async function deleteBook(id) {
  await ensureReady();
  return repo.remove(id);
}

export async function resetBooks() {
  await ensureReady();
  await repo.reset();
}
