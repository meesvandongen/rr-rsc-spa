import type { Route } from "./+types/rsc-static";

export function loader() {
  return {
    message: "Hello from the RSC loader",
    renderedAt: new Date().toISOString(),
  };
}

export function ServerComponent({ loaderData }: Route.ServerComponentProps) {
  return (
    <article data-testid="rsc-static-page">
      <h1>RSC static</h1>
      <p>
        A pure server component route with no client components. Everything on
        this page was rendered at build time and requires zero JavaScript.
      </p>
      <p data-testid="rsc-static-message">{loaderData.message}</p>
      <p data-testid="rsc-static-rendered-at">
        Prerendered at: {loaderData.renderedAt}
      </p>
    </article>
  );
}
