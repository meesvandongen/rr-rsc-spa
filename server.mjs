// Minimal static file server for the SPA-mode build output (build/client).
// Serves prerendered .html / .rsc files when they exist and falls back to the
// SPA shell for everything else — the same rewrite rule any static host
// (Netlify, Cloudflare Pages, nginx, ...) would need for this app.
import { existsSync, promises as fs } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("./build/client/", import.meta.url)));
const port = Number(process.env.PORT ?? 3000);

if (!existsSync(root)) {
  console.error(`Missing ${root} — run \`npm run build\` first.`);
  process.exit(1);
}

// When "/" itself is prerendered, React Router emits the SPA shell as
// __spa-fallback.html instead of index.html.
const fallback = existsSync(join(root, "__spa-fallback.html"))
  ? "__spa-fallback.html"
  : "index.html";

// Client-side navigations request `<path>.rsc` payloads; non-prerendered
// paths get the fallback payload instead of the fallback HTML document.
const rscFallback = "__spa-fallback.rsc";

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8",
  ".rsc": "text/x-component; charset=utf-8",
  ".data": "text/x-script; charset=utf-8",
  ".map": "application/json",
  ".png": "image/png",
  ".woff2": "font/woff2",
};

async function findFile(pathname) {
  const decoded = decodeURIComponent(pathname);
  const candidates = decoded.endsWith("/")
    ? [join(decoded, "index.html")]
    : [decoded, join(decoded, "index.html")];

  for (const candidate of candidates) {
    const filePath = resolve(root, normalize(candidate).replace(/^[/\\]+/, ""));
    if (!filePath.startsWith(root)) continue; // no path traversal
    try {
      const stat = await fs.stat(filePath);
      if (stat.isFile()) return filePath;
    } catch {
      // try next candidate
    }
  }
  if (decoded.endsWith(".rsc") && existsSync(join(root, rscFallback))) {
    return join(root, rscFallback);
  }
  return join(root, fallback);
}

createServer(async (req, res) => {
  try {
    const { pathname } = new URL(req.url ?? "/", `http://${req.headers.host}`);
    const filePath = await findFile(pathname);
    const body = await fs.readFile(filePath);
    res.writeHead(200, {
      "content-type": contentTypes[extname(filePath)] ?? "application/octet-stream",
    });
    res.end(body);
  } catch (error) {
    console.error(error);
    res.writeHead(500, { "content-type": "text/plain" });
    res.end("Internal server error");
  }
}).listen(port, () => {
  console.log(`Serving ${root} at http://localhost:${port} (fallback: ${fallback})`);
});
