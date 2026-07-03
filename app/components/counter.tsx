"use client";

import { useState } from "react";

// A client component ("island") embedded inside a server component route.
export function Counter({ testId }: { testId: string }) {
  const [count, setCount] = useState(0);

  return (
    <button data-testid={testId} onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  );
}
