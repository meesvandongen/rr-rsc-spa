import { type RouteConfig, index, route } from "@react-router/dev/routes";

// Every route is prerendered at build time (see react-router.config.ts).
// The permutations differ in HOW each route module is authored:
export default [
  // RSC routes: export `ServerComponent` — rendered on the server only.
  index("routes/home.tsx"),
  route("rsc/static", "routes/rsc-static.tsx"),
  route("rsc/with-client", "routes/rsc-with-client.tsx"),

  // "Normal" client routes: export `default` — the classic route module
  // shape, hydrated and interactive in the browser.
  route("client/prerendered", "routes/client-prerendered.tsx"),
  route("spa/about", "routes/spa-about.tsx"),
  route("spa/counter", "routes/spa-counter.tsx"),
] satisfies RouteConfig;
