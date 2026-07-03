import { expect, test } from "@playwright/test";

// This spec runs in the "no-js" project with `javaScriptEnabled: false`:
// everything asserted here comes straight from the prerendered HTML.

test("sanity: JavaScript is actually disabled", async ({ page }) => {
  await page.goto("/");
  // The hydration indicator is a client component that flips to "true" after
  // hydration. With JS disabled it must keep its server-rendered value.
  await expect(page.getByTestId("hydration-indicator")).toHaveAttribute(
    "data-hydrated",
    "false",
  );
});

test("RSC index route renders without JavaScript", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByTestId("home-page")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Home: an RSC route" }),
  ).toBeVisible();
  // Loader data was baked into the HTML at build time.
  await expect(page.getByTestId("home-rendered-at")).toContainText(
    "Loader ran at build time:",
  );
});

test("pure RSC route renders server loader data without JavaScript", async ({
  page,
}) => {
  await page.goto("/rsc/static");
  await expect(page.getByTestId("rsc-static-page")).toBeVisible();
  await expect(page.getByTestId("rsc-static-message")).toHaveText(
    "Hello from the RSC loader",
  );
  await expect(page.getByTestId("hydration-indicator")).toHaveAttribute(
    "data-hydrated",
    "false",
  );
});

test("RSC route with client island: server content renders, island is inert", async ({
  page,
}) => {
  await page.goto("/rsc/with-client");
  // Server-rendered part of the page is fully visible.
  await expect(page.getByTestId("rsc-with-client-message")).toHaveText(
    "Server-rendered text around a client island",
  );
  // The island's prerendered markup is present...
  const counter = page.getByTestId("island-counter");
  await expect(counter).toHaveText("Count: 0");
  // ...but without JavaScript it cannot become interactive.
  await counter.click();
  await expect(counter).toHaveText("Count: 0");
});

test("prerendered client route renders server loader data without JavaScript", async ({
  page,
}) => {
  await page.goto("/client/prerendered");
  await expect(page.getByTestId("client-prerendered-page")).toBeVisible();
  await expect(page.getByTestId("client-prerendered-message")).toHaveText(
    "Loader data baked in at build time",
  );
});

test("client route with clientLoader shows its hydrate fallback, not content", async ({
  page,
}) => {
  await page.goto("/spa/about");
  // The nav (part of the prerendered shell) is there...
  await expect(page.getByTestId("site-nav")).toBeVisible();
  // ...but the route content needs a clientLoader, which needs JavaScript.
  await expect(page.getByTestId("spa-about-fallback")).toBeVisible();
  await expect(page.getByTestId("spa-about-page")).toHaveCount(0);
});

test("interactive client route: markup is prerendered but stays inert", async ({
  page,
}) => {
  await page.goto("/spa/counter");
  const button = page.getByTestId("spa-counter-button");
  await expect(button).toHaveText("Count: 0");
  await button.click();
  await expect(button).toHaveText("Count: 0");
});

test("unknown URL serves the SPA fallback shell (404)", async ({ page }) => {
  await page.goto("/does-not-exist");
  await expect(page.getByTestId("error-boundary")).toBeVisible();
  await expect(page.getByRole("heading", { name: "404" })).toBeVisible();
});
