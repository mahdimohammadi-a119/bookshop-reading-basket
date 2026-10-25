import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Field from '../components/Field.jsx';
import { SUBJECTS } from '../data.js';
import { MESSAGE_MAX, validateContact } from '../helpers.js';

const EMPTY_FORM = { name: '', email: '', subject: '', bookId: '', message: '' };

// The "Request this title" button on an unavailable book opens this page with ?book=<id>.
export default function Contact({ books }) {
  const [params] = useSearchParams();
  const bookId = params.get('book') || '';
  const startBook = books.find((b) => b.id === bookId && b.copies === 0);

  return (
    <section>
      <header className="page-head">
        <h1>Contact and enquiries</h1>
        <p>
          Ask a question, send feedback, or request a title that is out of stock. This is a practice
          form, so nothing is sent to anyone.
        </p>
      </header>

      {/* A new key starts the form again when another book link is opened. */}
      <ContactForm key={bookId} books={books} startBook={startBook} />
    </section>
  );
}

function ContactForm({ books, startBook }) {
  const [form, setForm] = useState({
    ...EMPTY_FORM,
    subject: startBook ? 'request' : '',
    bookId: startBook ? startBook.id : '',
  });
  const [errors, setErrors] = useState({});
  const [preview, setPreview] = useState(null);

  const unavailable = books.filter((b) => b.copies === 0);

  function change(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  function submit(event) {
    event.preventDefault();

    const found = validateContact(form);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      setPreview(null);
      return;
    }

    const book = books.find((b) => b.id === form.bookId);
    setPreview({
      name: form.name.trim(),
      email: form.email.trim(),
      subject: SUBJECTS.find((s) => s.value === form.subject).label,
      book: form.subject === 'request' && book ? `${book.title} (${book.format})` : 'Not applicable',
      message: form.message.trim(),
    });

    // Clear the form only after a valid submit.
    setForm(EMPTY_FORM);
    setErrors({});
  }

  return (
    <div className="contact-layout">
      <form className="panel" onSubmit={submit} noValidate>
        <Field id="name" label="Your name" error={errors.name}>
          <input id="name" name="name" value={form.name} onChange={change} />
        </Field>

        <Field id="email" label="Email address" error={errors.email}>
          <input id="email" name="email" type="email" value={form.email} onChange={change} />
        </Field>

        <Field id="subject" label="Subject" error={errors.subject}>
          <select id="subject" name="subject" value={form.subject} onChange={change}>
            <option value="">Choose one</option>
            {SUBJECTS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </Field>

        {/* This field only appears for a title request. */}
        {form.subject === 'request' && (
          <Field id="bookId" label="Unavailable title" error={errors.bookId}>
            <select id="bookId" name="bookId" value={form.bookId} onChange={change}>
              <option value="">Choose a title</option>
              {unavailable.map((book) => (
                <option key={book.id} value={book.id}>
                  {book.title} ({book.format})
                </option>
              ))}
            </select>
          </Field>
        )}

        <Field id="message" label="Message" error={errors.message}>
          <textarea id="message" name="message" maxLength={MESSAGE_MAX} value={form.message} onChange={change} />
          <p id="message-count" className="counter">
            {form.message.length} / {MESSAGE_MAX} characters
          </p>
        </Field>

        <div className="form-actions">
          <button type="submit" className="btn">
            Send sample request
          </button>
        </div>
      </form>

      {preview && (
        <section className="panel">
          <h2>Request preview</h2>
          <p className="muted">This is a sample. Nothing has been sent to anyone.</p>
          <dl className="summary-list">
            <div>
              <dt>Name</dt>
              <dd>{preview.name}</dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>{preview.email}</dd>
            </div>
            <div>
              <dt>Subject</dt>
              <dd>{preview.subject}</dd>
            </div>
            <div>
              <dt>Title</dt>
              <dd>{preview.book}</dd>
            </div>
          </dl>
          <p>{preview.message}</p>
        </section>
      )}
    </div>
  );
}
