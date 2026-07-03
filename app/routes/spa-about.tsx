import type { Route } from "./+types/spa-about";

// A "normal" client route whose data comes from a clientLoader, which only
// runs in the browser. At prerender time there is no data, so the built HTML
// contains this route's HydrateFallback instead of its content — meaning this
// page requires JavaScript to show its content.
export function clientLoader() {
  return {
    message: "Data loaded in the browser by clientLoader",
  };
}

export function HydrateFallback() {
  return <p data-testid="spa-about-fallback">Loading about page&hellip;</p>;
}

export default function SpaAbout({ loaderData }: Route.ComponentProps) {
  return (
    <article data-testid="spa-about-page">
      <h1>SPA about</h1>
      <p>
        This client route gets its data from a <code>clientLoader</code>.
        Without JavaScript you only see its hydrate fallback.
      </p>
      <p data-testid="spa-about-message">{loaderData.message}</p>
    </article>
  );
}
