import type { Route } from "./+types/home";

export function loader() {
  return {
    renderedAt: new Date().toISOString(),
  };
}

// A React Server Component route: it runs at build time (this app prerenders
// it with `ssr: false`), and its HTML works without any JavaScript.
export function ServerComponent({ loaderData }: Route.ServerComponentProps) {
  return (
    <article data-testid="home-page">
      <h1>Home: an RSC route</h1>
      <p>
        This page is a React Server Component route (it exports{" "}
        <code>ServerComponent</code>) and is prerendered at build time in SPA
        mode (<code>ssr: false</code>).
      </p>
      <p data-testid="home-rendered-at">
        Loader ran at build time: {loaderData.renderedAt}
      </p>
    </article>
  );
}
