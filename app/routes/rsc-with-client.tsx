import { Counter } from "../components/counter";
import type { Route } from "./+types/rsc-with-client";

export function loader() {
  return {
    message: "Server-rendered text around a client island",
  };
}

// A server component route that embeds a "use client" component. The static
// text works without JavaScript; the counter becomes interactive once the
// island hydrates.
export function ServerComponent({ loaderData }: Route.ServerComponentProps) {
  return (
    <article data-testid="rsc-with-client-page">
      <h1>RSC with a client island</h1>
      <p data-testid="rsc-with-client-message">{loaderData.message}</p>
      <Counter testId="island-counter" />
    </article>
  );
}
