// Every call from the browser to the backend goes through this file.

export class ApiError extends Error {
  constructor(message, status, errors = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    // Field-by-field messages, for example { title: 'Title needs 2 characters.' }
    this.errors = errors;
  }
}

async function request(path, { method = 'GET', body } = {}) {
  const response = await fetch(`/api${path}`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : {},
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'same-origin',
  });

  // If the server sends something that is not JSON, use an empty object.
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new ApiError(data.error || 'Something went wrong. Please try again.', response.status, data.errors);
  }
  return data;
}

export const api = {
  async getBooks() {
    const data = await request('/books');
    return data.books;
  },

  async createBook(book) {
    const data = await request('/books', { method: 'POST', body: book });
    return data.book;
  },

  async updateBook(id, book) {
    const data = await request(`/books/${encodeURIComponent(id)}`, { method: 'PUT', body: book });
    return data.book;
  },

  async deleteBook(id) {
    await request(`/books/${encodeURIComponent(id)}`, { method: 'DELETE' });
  },

  async resetBooks() {
    await request('/admin/reset', { method: 'POST' });
  },

  // Returns { admin: { username } } on success. Throws ApiError when the login is wrong.
  login(username, password) {
    return request('/auth/login', { method: 'POST', body: { username, password } });
  },

  logout() {
    return request('/auth/logout', { method: 'POST' });
  },

  // Returns { admin: { username } } when logged in, or { admin: null }.
  me() {
    return request('/auth/me');
  },
};
