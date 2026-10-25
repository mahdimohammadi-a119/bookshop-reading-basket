# Bookshop Reading Basket

A small full-stack course project. Browse real books, build a reading basket, and check it against a budget. An admin can log in to add, edit and delete books.

- **Frontend:** React + Vite (`src/`)
- **Backend:** Vercel serverless functions (`api/`) with shared rules in `shared/` and server code in `server/`
- **Database:** Postgres (Neon, from the Vercel Marketplace). Without a database, books are kept in memory for local testing.

## Project structure

| Path | What it does |
| --- | --- |
| `src/App.jsx` | Loads books, keeps the basket and admin session, decides which page is shown |
| `src/api.js` | Every call from the browser to the backend |
| `src/storage.js` | Saves the basket and budget in the browser, so a refresh keeps them |
| `src/components/Navbar.jsx` | Top menu. "Manage" and "Log out" appear only for the admin |
| `src/components/Footer.jsx` | Footer shown on every page |
| `src/pages/Login.jsx` | Admin login form |
| `src/pages/Manage.jsx` | Admin page to add, edit and delete books |
| `api/` | API endpoints: `auth/`, `books/`, `admin/` |
| `server/auth.js` | Admin login check and signed session cookie |
| `server/store.js` | Reads and writes books (Postgres or memory) |
| `server/seed.js` | The 12 sample books, with real ISBNs |
| `shared/catalog.js` | Book rules (checked by the server, and the ISBN check digit) |

## Admin login

| | Default (course) | Change it with |
| --- | --- | --- |
| Username | `admin` | `ADMIN_USERNAME` |
| Password | `Admin@2026` | `ADMIN_PASSWORD` |
| Session signing key | derived from the password | `ADMIN_SECRET` (recommended) |

The fallback values are in `server/auth.js`. On Vercel, set the environment variables in the project settings. They override the fallback values, so you do not need to change the code.

## Run it locally

```bash
npm install
cp .env.example .env.local     # optional: edit the admin login
npx vercel login               # once
npx vercel link                # once, to link the folder to a Vercel project (optional for local use)
npx vercel dev                 # starts the frontend and /api together
```

Open the address shown in the terminal (usually http://localhost:3000). `npm run dev` runs only the Vite frontend, which cannot load books without the API. Vercel uses this script internally, so do not change it to call `vercel dev`.

## Deploy on Vercel

1. Push the project to GitHub.
2. In Vercel, click **Add New → Project** and import the repository. The Vite settings are detected automatically.
3. In the project, open **Storage** and add **Neon Postgres** from the Marketplace. This sets `DATABASE_URL` for you.
4. Open **Settings → Environment Variables** and add `ADMIN_USERNAME`, `ADMIN_PASSWORD` and `ADMIN_SECRET` (a long random text).
5. Deploy. Visit `/login` to log in as admin.

The first request creates the `books` table and adds the 12 sample books. The basket is saved in each visitor's browser, so it is not shared between devices.

## API

| Method | Path | Who | Purpose |
| --- | --- | --- | --- |
| GET | `/api/books` | everyone | List books |
| GET | `/api/books/:id` | everyone | One book |
| POST | `/api/books` | admin | Add a book |
| PUT | `/api/books/:id` | admin | Change a book |
| DELETE | `/api/books/:id` | admin | Delete a book |
| POST | `/api/admin/reset` | admin | Put the sample books back |
| POST | `/api/auth/login` | everyone | Log in (sets an HTTP-only cookie) |
| POST | `/api/auth/logout` | everyone | Log out |
| GET | `/api/auth/me` | everyone | Is this browser logged in as admin? |

## Notes

- Book covers are loaded from Open Library using the ISBN. If a cover is missing, the app shows a genre picture.
- Prices and stock numbers are sample values for the course. Titles, authors and ISBNs are real.
- The admin password in the code is for a course project only. Use the environment variables for anything real.
