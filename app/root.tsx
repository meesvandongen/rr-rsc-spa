import {
  isRouteErrorResponse,
  Link,
  Links,
  Meta,
  Outlet,
  ScrollRestoration,
} from "react-router";

import type { Route } from "./+types/root";
import { HydrationIndicator } from "./components/hydration-indicator";
import "./app.css";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>React Router RSC + SPA demo</title>
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <>
      <header>
        <nav data-testid="site-nav">
          <Link to="/">Home (RSC)</Link>
          <Link to="/rsc/static">RSC static</Link>
          <Link to="/rsc/with-client">RSC + island</Link>
          <Link to="/client/prerendered">Client prerendered</Link>
          <Link to="/spa/about">SPA about</Link>
          <Link to="/spa/counter">SPA counter</Link>
        </nav>
        <HydrationIndicator />
      </header>
      <main>
        <Outlet />
      </main>
    </>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main data-testid="error-boundary">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre>
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
