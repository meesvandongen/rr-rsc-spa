import type { Config } from "@react-router/dev/config";

export default {
  // SPA mode: no runtime server. Everything is served as static files.
  ssr: false,

  // Prerender every static path at build time. Each path gets a static
  // `.html` document plus a `.rsc` payload used for client-side navigations.
  //
  // Note: in RSC framework mode, route elements are always produced by the
  // RSC render — even for "client" routes that export `default`. With
  // `ssr: false` there is no runtime server, so any path that is NOT
  // prerendered has no way to render and falls back to the SPA shell
  // (`__spa-fallback.html`), which lands in the root error boundary (404).
  // That's also what unknown URLs get.
  prerender: true,
} satisfies Config;
