import { useState } from 'react';

// Shows the cover of one book.
// 1. It uses book.coverUrl (an Open Library link made from the ISBN).
// 2. If there is no link, or the picture fails to load, it shows the simple genre picture instead.
export default function Cover({ book, className, alt }) {
  // Remember which link failed, so a different book (or a new link) is tried again.
  const [failedUrl, setFailedUrl] = useState(null);

  const useFallback = !book.coverUrl || failedUrl === book.coverUrl;
  const src = useFallback ? `/covers/${book.genre}.svg` : book.coverUrl;

  return (
    <img
      className={className}
      src={src}
      alt={alt ?? `Cover of ${book.title}`}
      loading="lazy"
      onError={() => setFailedUrl(book.coverUrl)}
    />
  );
}
