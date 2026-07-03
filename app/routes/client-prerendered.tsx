import type { Route } from "./+types/client-prerendered";

export function loader() {
  return {
    message: "Loader data baked in at build time",
  };
}

// A traditional client route module (exports `default`, not
// `ServerComponent`) that is listed in the `prerender` config, so its HTML is
// also generated at build time and its static content works without
// JavaScript.
export default function ClientPrerendered({
  loaderData,
}: Route.ComponentProps) {
  return (
    <article data-testid="client-prerendered-page">
      <h1>Client route, prerendered</h1>
      <p>
        This is a regular (non-RSC) route module, but it is prerendered, so
        its initial HTML is fully rendered too.
      </p>
      <p data-testid="client-prerendered-message">{loaderData.message}</p>
    </article>
  );
}
