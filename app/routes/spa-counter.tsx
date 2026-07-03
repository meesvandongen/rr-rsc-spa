import { useState } from "react";

// A "normal" interactive client route. Its static markup is prerendered (so
// it is visible without JavaScript), but the counter only works once the
// page hydrates.
export default function SpaCounter() {
  const [count, setCount] = useState(0);

  return (
    <article data-testid="spa-counter-page">
      <h1>SPA counter</h1>
      <p>
        A classic client route. The markup below is prerendered, but clicking
        only works after hydration.
      </p>
      <button
        data-testid="spa-counter-button"
        onClick={() => setCount(count + 1)}
      >
        Count: {count}
      </button>
    </article>
  );
}
