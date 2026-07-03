import { expect, test, type Page } from "@playwright/test";

// This spec runs in the "js" project: it validates hydration, client
// islands, and client-side navigation between RSC pages and normal pages.

async function waitForHydration(page: Page) {
  await expect(page.getByTestId("hydration-indicator")).toHaveAttribute(
    "data-hydrated",
    "true",
  );
}

// Plant a marker on window after hydration; if it survives a navigation, the
// navigation was client-side (no full document reload).
async function plantNavigationMarker(page: Page) {
  await waitForHydration(page);
  await page.evaluate(() => {
    (window as { __noReloadMarker?: boolean }).__noReloadMarker = true;
  });
}

async function expectNoFullReload(page: Page) {
  expect(
    await page.evaluate(
      () => (window as { __noReloadMarker?: boolean }).__noReloadMarker,
    ),
  ).toBe(true);
}

test("client route with clientLoader renders its content", async ({
  page,
}) => {
  await page.goto("/spa/about");
  await expect(page.getByTestId("spa-about-page")).toBeVisible();
  await expect(page.getByTestId("spa-about-message")).toHaveText(
    "Data loaded in the browser by clientLoader",
  );
  // The hydrate fallback from the prerendered HTML is gone.
  await expect(page.getByTestId("spa-about-fallback")).toHaveCount(0);
});

test("interactive client route counter works after hydration", async ({
  page,
}) => {
  await page.goto("/spa/counter");
  await waitForHydration(page);
  const button = page.getByTestId("spa-counter-button");
  await button.click();
  await expect(button).toHaveText("Count: 1");
  await button.click();
  await expect(button).toHaveText("Count: 2");
});

test("client island inside an RSC route becomes interactive", async ({
  page,
}) => {
  await page.goto("/rsc/with-client");
  await waitForHydration(page);
  // Server-rendered content is still there...
  await expect(page.getByTestId("rsc-with-client-message")).toHaveText(
    "Server-rendered text around a client island",
  );
  // ...and the "use client" island now responds to clicks.
  const counter = page.getByTestId("island-counter");
  await counter.click();
  await expect(counter).toHaveText("Count: 1");
});

test.describe("client-side navigation permutations", () => {
  test("RSC page -> RSC page", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("home-page")).toBeVisible();
    await plantNavigationMarker(page);

    await page.getByRole("link", { name: "RSC static" }).click();
    await expect(page.getByTestId("rsc-static-message")).toHaveText(
      "Hello from the RSC loader",
    );
    await expectNoFullReload(page);
  });

  test("RSC page -> normal page", async ({ page }) => {
    await page.goto("/rsc/static");
    await expect(page.getByTestId("rsc-static-page")).toBeVisible();
    await plantNavigationMarker(page);

    await page.getByRole("link", { name: "SPA counter" }).click();
    const button = page.getByTestId("spa-counter-button");
    await button.click();
    await expect(button).toHaveText("Count: 1");
    await expectNoFullReload(page);
  });

  test("normal page -> RSC page fetches a prerendered .rsc payload", async ({
    page,
  }) => {
    await page.goto("/spa/about");
    await expect(page.getByTestId("spa-about-page")).toBeVisible();
    await plantNavigationMarker(page);

    // Client-side navigation to an RSC route is driven by the .rsc payload
    // that was prerendered at build time.
    const rscRequest = page.waitForRequest((request) =>
      request.url().includes("/rsc/with-client.rsc"),
    );
    await page.getByRole("link", { name: "RSC + island" }).click();
    await rscRequest;

    await expect(page.getByTestId("rsc-with-client-message")).toHaveText(
      "Server-rendered text around a client island",
    );
    const counter = page.getByTestId("island-counter");
    await counter.click();
    await expect(counter).toHaveText("Count: 1");
    await expectNoFullReload(page);
  });

  test("normal page -> normal page", async ({ page }) => {
    await page.goto("/spa/counter");
    await expect(page.getByTestId("spa-counter-page")).toBeVisible();
    await plantNavigationMarker(page);

    await page.getByRole("link", { name: "SPA about" }).click();
    await expect(page.getByTestId("spa-about-message")).toHaveText(
      "Data loaded in the browser by clientLoader",
    );
    await expectNoFullReload(page);
  });

  test("round trip: RSC -> normal -> RSC", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("home-page")).toBeVisible();
    await plantNavigationMarker(page);

    await page.getByRole("link", { name: "SPA about" }).click();
    await expect(page.getByTestId("spa-about-page")).toBeVisible();

    await page.getByRole("link", { name: "Home (RSC)" }).click();
    await expect(page.getByTestId("home-page")).toBeVisible();
    await expectNoFullReload(page);
  });
});

test.describe("direct loads hydrate every page type", () => {
  for (const [path, testId] of [
    ["/", "home-page"],
    ["/rsc/static", "rsc-static-page"],
    ["/rsc/with-client", "rsc-with-client-page"],
    ["/client/prerendered", "client-prerendered-page"],
    ["/spa/about", "spa-about-page"],
    ["/spa/counter", "spa-counter-page"],
  ] as const) {
    test(`direct load of ${path}`, async ({ page }) => {
      const pageErrors: Error[] = [];
      page.on("pageerror", (error) => pageErrors.push(error));

      await page.goto(path);
      await expect(page.getByTestId(testId)).toBeVisible();
      await waitForHydration(page);

      expect(pageErrors).toEqual([]);
    });
  }
});

test("unknown URL renders the 404 error boundary", async ({ page }) => {
  await page.goto("/does-not-exist");
  await expect(page.getByTestId("error-boundary")).toBeVisible();
  await expect(page.getByRole("heading", { name: "404" })).toBeVisible();
});
