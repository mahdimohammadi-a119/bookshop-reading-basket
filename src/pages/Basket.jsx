import { Link } from 'react-router-dom';
import Cover from '../components/Cover.jsx';
import Field from '../components/Field.jsx';
import { basketRows, budgetError, formatPrice, toNumber } from '../helpers.js';

export default function Basket({ books, basket, budget, onBudgetChange, onChange, onRemove, onReset }) {
  // Step 1: build the rows from the basket and the books.
  const rows = basketRows(basket, books);

  // Step 2: add up the total.
  const total = rows.reduce((sum, row) => sum + row.lineTotal, 0);

  // Step 3: check the budget. If it is wrong, we do not do any maths with it.
  const error = budgetError(budget);
  const amount = error ? null : toNumber(budget);
  const remaining = amount === null ? null : amount - total;

  function handleReset() {
    if (window.confirm('Remove every book from your basket?')) onReset();
  }

  return (
    <section>
      <header className="page-head">
        <h1>Reading basket</h1>
        <p>Change quantities, remove books, and check the total against your budget. Prices are in AFN.</p>
      </header>

      <div className="basket-layout">
        <div className="panel">
          {rows.length === 0 ? (
            <div className="empty">
              <h2>Your basket is empty</h2>
              <p>Pick a few books and they will show up here.</p>
              <Link to="/books" className="btn">
                Browse books
              </Link>
            </div>
          ) : (
            <>
              <div className="panel-head">
                <h2>Your books</h2>
                <button type="button" className="btn btn-ghost btn-sm" onClick={handleReset}>
                  Reset basket
                </button>
              </div>

              <ul className="basket-list">
                {rows.map((row) => (
                  <li key={row.id} className="basket-row">
                    <Cover className="thumb" book={row} alt="" />

                    <div className="info">
                      <h3>{row.title}</h3>
                      <p>
                        {row.format} · {formatPrice(row.priceAFN)} each · {row.copies} available
                      </p>
                    </div>

                    <div className="qty-control" role="group" aria-label={`Quantity of ${row.title}, ${row.format}`}>
                      <button
                        type="button"
                        aria-label={`Decrease quantity of ${row.title}, ${row.format}`}
                        disabled={row.quantity <= 1}
                        onClick={() => onChange(row.id, row.quantity - 1)}
                      >
                        −
                      </button>
                      <span aria-live="polite">{row.quantity}</span>
                      <button
                        type="button"
                        aria-label={`Increase quantity of ${row.title}, ${row.format}`}
                        disabled={row.quantity >= row.copies}
                        onClick={() => onChange(row.id, row.quantity + 1)}
                      >
                        +
                      </button>
                    </div>

                    <span className="line-total">{formatPrice(row.lineTotal)}</span>

                    <button type="button" className="link-danger" onClick={() => onRemove(row.id)}>
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

        <aside className="panel">
          <h2>Budget</h2>
          <Field id="budget" label="Spending budget (AFN)" error={error}>
            <input
              id="budget"
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={budget}
              onChange={(event) => onBudgetChange(event.target.value)}
            />
          </Field>

          <dl className="summary-list">
            <div>
              <dt>Basket total</dt>
              <dd>{formatPrice(total)}</dd>
            </div>
            <div>
              <dt>Budget</dt>
              <dd>{amount === null ? 'Not set' : formatPrice(amount)}</dd>
            </div>
          </dl>

          {remaining !== null &&
            (remaining < 0 ? (
              <p className="result-line shortfall" role="status">
                Shortfall: {formatPrice(-remaining)} over budget
              </p>
            ) : (
              <p className="result-line remaining" role="status">
                Remaining: {formatPrice(remaining)}
              </p>
            ))}
        </aside>
      </div>
    </section>
  );
}
