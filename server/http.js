// Small helpers shared by the API functions.

// Wraps a handler so an unexpected error returns a clean JSON message instead of crashing.
export function handle(fn) {
  return async (req, res) => {
    try {
      return await fn(req, res);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Something went wrong on the server. Please try again.' });
    }
  };
}

// Answers 405 when the request uses a method this endpoint does not accept.
export function methodNotAllowed(res, allowed) {
  res.setHeader('Allow', allowed.join(', '));
  return res.status(405).json({ error: 'This request method is not allowed here.' });
}

// Answers 422 with one message for each field that is wrong.
export function invalidInput(res, errors) {
  return res.status(422).json({ error: 'Please check the highlighted fields.', errors });
}
