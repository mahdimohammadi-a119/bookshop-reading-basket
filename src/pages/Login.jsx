import { useState } from 'react';
import Field from '../components/Field.jsx';

// The admin login form. On success, App sends the admin to the Manage page.
export default function Login({ onLogin }) {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  function change(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function submit(event) {
    event.preventDefault();

    if (form.username.trim() === '' || form.password === '') {
      setError('Enter your username and password.');
      return;
    }

    setBusy(true);
    setError('');
    try {
      await onLogin(form.username.trim(), form.password);
    } catch (err) {
      setError(err.message);
      setForm({ ...form, password: '' });
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="narrow">
      <header className="page-head">
        <h1>Admin login</h1>
        <p>Only the admin can add, edit or delete books.</p>
      </header>

      <form className="panel" onSubmit={submit} noValidate>
        {error && (
          <p className="notice notice-error" role="alert">
            {error}
          </p>
        )}

        <Field id="username" label="Username">
          <input
            id="username"
            name="username"
            autoComplete="username"
            value={form.username}
            onChange={change}
          />
        </Field>

        <Field id="password" label="Password">
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={form.password}
            onChange={change}
          />
        </Field>

        <div className="form-actions">
          <button type="submit" className="btn" disabled={busy}>
            {busy ? 'Checking…' : 'Log in'}
          </button>
        </div>
      </form>
    </section>
  );
}
