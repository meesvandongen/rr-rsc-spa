# React Router: RSC + Framework Mode + SPA Mode + Prerendering

A demo of [React Router's unstable RSC Framework Mode](https://reactrouter.com/how-to/react-server-components)
combining:

- **Framework mode** — file-based route modules via `@react-router/dev`
- **RSC** — routes that export `ServerComponent` and `"use client"` islands,
  built with the `unstable_reactRouterRSC` Vite plugin + `@vitejs/plugin-rsc`
- **SPA mode** — `ssr: false`: no runtime server, output is purely static
- **Prerendering** — `prerender: true`: every route is rendered to static
  `.html` (for document requests) and `.rsc` payloads (for client-side
  navigations) at build time

## Route permutations

| Route | Module shape | Without JavaScript | With JavaScript |
| --- | --- | --- | --- |
| `/` | RSC (`ServerComponent`) | full content | hydrates, client-side nav |
| `/rsc/static` | RSC, server `loader` | full content incl. loader data | hydrates, client-side nav |
| `/rsc/with-client` | RSC + `"use client"` island | server content visible, island inert | island counter works |
| `/client/prerendered` | classic client route, server `loader` | full content incl. build-time loader data | hydrates, client-side nav |
| `/spa/about` | classic client route, `clientLoader` | route `HydrateFallback` only | clientLoader runs, content renders |
| `/spa/counter` | classic client route, `useState` | markup visible, button inert | counter works |
| anything else | — | SPA fallback shell → 404 boundary | 404 boundary |

Client-side navigations between RSC pages and normal pages (all four
directions) go through the prerendered `.rsc` payloads — no full document
reloads.

### A note on SPA mode + RSC

In RSC framework mode, route elements are always produced by the RSC render —
even for classic routes that export `default`. With `ssr: false` there is no
runtime server, so **every navigable path must be prerendered**. Paths that
are not prerendered are served the SPA fallback shell
(`build/client/__spa-fallback.html`), which lands in the root 404 error
boundary. This differs from non-RSC SPA mode, where the router can match and
render routes entirely in the browser.

## Serving the build

`server.mjs` is a minimal static file server that implements the rewrite
rules any static host needs for this app:

1. Serve the exact file if it exists (`.html`, `.rsc`, assets)
2. Serve `<path>/index.html` for prerendered document requests
3. Otherwise serve `__spa-fallback.rsc` for `.rsc` requests and
   `__spa-fallback.html` for everything else

## Commands

```sh
npm install
npx playwright install chromium  # once, for tests

npm run dev        # dev server (full RSC dev experience)
npm run build      # static build incl. prerendering into build/client
npm start          # serve the static build on :3000
npm test           # build + run the Playwright suites
npm run typecheck  # route typegen + tsc
```

## Tests

Two Playwright projects validate the matrix above:

- **`no-js`** (`tests/no-js.spec.ts`) runs with `javaScriptEnabled: false`
  and proves the prerendered RSC/loader content renders from static HTML
  alone — including a sanity check that hydration really never happened, and
  that JS-dependent routes do *not* render their content.
- **`js`** (`tests/with-js.spec.ts`) validates hydration on direct loads of
  every page type, interactive `"use client"` islands inside RSC routes,
  `clientLoader` data, and client-side navigation permutations
  (RSC→RSC, RSC→normal, normal→RSC, normal→normal, and a round trip) —
  asserting no full document reloads and that `.rsc` payloads are fetched.
