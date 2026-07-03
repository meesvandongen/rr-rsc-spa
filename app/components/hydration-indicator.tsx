"use client";

import { useEffect, useState } from "react";

// Flips to "true" only after React has hydrated in the browser. The Playwright
// tests use this both to wait for hydration (JS enabled) and to prove that no
// JavaScript ran (JS disabled).
export function HydrationIndicator() {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  return (
    <span
      data-testid="hydration-indicator"
      data-hydrated={hydrated ? "true" : "false"}
    >
      {hydrated ? "hydrated" : "not hydrated"}
    </span>
  );
}
