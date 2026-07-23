import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the Benchboard cost dashboard", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Benchboard — Woodworking Cost Studio<\/title>/i);
  assert.match(html, /Your workshop at a glance/);
  assert.match(html, /Raw materials/);
  assert.match(html, /Machine time/);
  assert.match(html, /Selling platforms/);
  assert.match(html, /Walnut serving board/);
  assert.match(html, /Benchboard stores data in this browser/);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton|Your site is taking shape/i);
});

test("ships the product calculator and local persistence", async () => {
  const [page, layout, packageJson] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  assert.match(page, /benchboard-cogs-v1/);
  assert.match(page, /platformResult/);
  assert.match(page, /getProductCosts/);
  assert.match(page, /Export backup/);
  assert.match(page, /Profit by selling platform/);
  assert.match(layout, /Benchboard — Woodworking Cost Studio/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
});
