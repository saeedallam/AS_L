#!/usr/bin/env node
/**
 * HTTP smoke tests against a running build:
 *   npm run build && npm start   (or a deployed URL)
 *   BASE_URL=http://localhost:3000 node tests/smoke.mjs
 * Tests that need the database are skipped with DB=off.
 */
const BASE = (process.env.BASE_URL || "http://localhost:3000").replace(/\/$/, "");
const DB = process.env.DB !== "off";
const origin = new URL(BASE).origin;
let failed = 0;
let passed = 0;

async function check(name, fn) {
  try {
    await fn();
    passed++;
    console.log(`  ✓ ${name}`);
  } catch (error) {
    failed++;
    console.log(`  ✗ ${name}\n      ${error.message}`);
  }
}
function expect(cond, msg) {
  if (!cond) throw new Error(msg);
}
const json = (body) => ({ method: "POST", headers: { "Content-Type": "application/json", Origin: origin }, body: JSON.stringify(body) });

console.log(`Smoke tests against ${BASE} (database checks: ${DB ? "on" : "off"})`);

await check("home page renders with security headers", async () => {
  const res = await fetch(`${BASE}/ar`);
  expect(res.status === 200, `status ${res.status}`);
  expect(res.headers.get("x-frame-options") === "DENY", "missing X-Frame-Options");
  expect(res.headers.get("x-content-type-options") === "nosniff", "missing nosniff");
  expect(!res.headers.get("x-powered-by"), "x-powered-by leaked");
  const html = await res.text();
  expect(html.includes("مكتبة أسماء النموذجية"), "business name missing");
  expect(html.includes('rel="canonical"'), "canonical missing");
});

await check("admin page redirects anonymous visitors to login", async () => {
  const res = await fetch(`${BASE}/ar/admin`, { redirect: "manual" });
  expect([302, 303, 307, 308].includes(res.status), `status ${res.status}`);
  expect((res.headers.get("location") || "").includes("/ar/admin/login"), "not redirected to login");
});

await check("admin data API rejects anonymous reads (401)", async () => {
  const res = await fetch(`${BASE}/api/admin/data`);
  expect(res.status === 401, `status ${res.status}`);
});

await check("admin data API rejects anonymous writes (401)", async () => {
  const res = await fetch(`${BASE}/api/admin/data`, json({ op: "category.create", payload: { name_ar: "اختبار" } }));
  expect(res.status === 401, `status ${res.status}`);
});

await check("admin writes from another origin are blocked (CSRF 403)", async () => {
  const res = await fetch(`${BASE}/api/admin/data`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: "https://evil.example" },
    body: JSON.stringify({ op: "product.delete", payload: { id: "00000000-0000-4000-a000-000000000000" } }),
  });
  expect(res.status === 403, `status ${res.status}`);
});

await check("unknown admin operations are rejected (no orders/e-commerce)", async () => {
  const res = await fetch(`${BASE}/api/admin/data`, json({ op: "order.create", payload: {} }));
  expect(res.status === 400, `status ${res.status}`);
});

await check("anonymous image upload is rejected (401)", async () => {
  const fd = new FormData();
  fd.append("bucket", "product-images");
  fd.append("file", new Blob([new Uint8Array([0x89, 0x50, 0x4e, 0x47])], { type: "image/png" }), "a.png");
  const res = await fetch(`${BASE}/api/admin/upload`, { method: "POST", body: fd, headers: { Origin: origin } });
  expect(res.status === 401, `status ${res.status}`);
});

await check("contact messages cannot be read publicly (405)", async () => {
  const res = await fetch(`${BASE}/api/contact`);
  expect(res.status === 405, `status ${res.status}`);
});

await check("contact form validates input server-side (422 + field errors)", async () => {
  const res = await fetch(`${BASE}/api/contact`, json({ name: "x", phone: "abc", email: "bad", message: "" }));
  expect(res.status === 422, `status ${res.status}`);
  const body = await res.json();
  for (const f of ["name", "phone", "email", "message"]) expect(body.fieldErrors?.[f], `no error for ${f}`);
});

await check("contact form rejects cross-origin posts (403)", async () => {
  const res = await fetch(`${BASE}/api/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: "https://evil.example" },
    body: JSON.stringify({ name: "زائر", phone: "01012345678", message: "رسالة اختبار" }),
  });
  expect(res.status === 403, `status ${res.status}`);
});

await check("contact form rejects non-JSON bodies (400)", async () => {
  const res = await fetch(`${BASE}/api/contact`, { method: "POST", headers: { Origin: origin, "Content-Type": "text/plain" }, body: "name=x" });
  expect(res.status === 400, `status ${res.status}`);
});

await check("honeypot submissions get a silent fake success", async () => {
  const res = await fetch(`${BASE}/api/contact`, json({ name: "Bot", phone: "01012345678", message: "spam spam spam", website_honeypot: "http://spam", elapsed_ms: 9000 }));
  expect(res.status === 201, `status ${res.status}`);
});

await check("instant (bot-speed) submissions get a silent fake success", async () => {
  const res = await fetch(`${BASE}/api/contact`, json({ name: "Bot", phone: "01012345678", message: "spam spam spam", elapsed_ms: 50 }));
  expect(res.status === 201, `status ${res.status}`);
});

await check("health/keep-alive endpoint rejects calls without the cron secret (401)", async () => {
  const res = await fetch(`${BASE}/api/health`, { headers: { Authorization: "Bearer wrong" } });
  expect(res.status === 401, `status ${res.status}`);
});

if (process.env.CRON_SECRET && DB) {
  await check("[db] health endpoint reaches the database with the cron secret", async () => {
    const res = await fetch(`${BASE}/api/health`, { headers: { Authorization: `Bearer ${process.env.CRON_SECRET}` } });
    const body = await res.json();
    expect(res.status === 200 && body.database === "up", `status ${res.status} ${JSON.stringify(body)}`);
  });
}

await check("login rejects malformed input (400)", async () => {
  const res = await fetch(`${BASE}/api/admin/auth`, json({ email: "not-an-email", password: "" }));
  expect(res.status === 400, `status ${res.status}`);
});

await check("robots.txt blocks admin and API, links sitemap", async () => {
  const res = await fetch(`${BASE}/robots.txt`);
  const text = await res.text();
  expect(res.status === 200, `status ${res.status}`);
  expect(text.includes("Sitemap:"), "no sitemap line");
});

await check("sitemap.xml is served", async () => {
  const res = await fetch(`${BASE}/sitemap.xml`);
  expect(res.status === 200 && (await res.text()).includes("<urlset"), `status ${res.status}`);
});

/** Streaming responses keep status 200; Next.js then renders the 404 UI with noindex. */
async function expectNotFound(path) {
  const res = await fetch(`${BASE}${path}`);
  if (res.status === 404) return;
  const html = await res.text();
  expect(res.status === 200 && html.includes('name="robots" content="noindex"') && html.includes("NEXT_HTTP_ERROR_FALLBACK;404"), `status ${res.status} without not-found page`);
}

await check("malformed product slugs render the noindex 404 page", () => expectNotFound("/ar/products/BAD%24slug"));
await check("unknown paths render the noindex 404 page", () => expectNotFound("/ar/no/such/page"));

if (DB) {
  await check("[db] catalogue lists products", async () => {
    const html = await (await fetch(`${BASE}/ar/products`)).text();
    expect(/href="\/ar\/products\/[a-z0-9-]+"/.test(html), "no product links");
  });
  await check("[db] search, filter and pagination work", async () => {
    const res = await fetch(`${BASE}/ar/products?q=${encodeURIComponent("قلم")}&sort=name&page=1`);
    expect(res.status === 200, `status ${res.status}`);
    const page2 = await fetch(`${BASE}/ar/products?page=2`);
    expect(page2.status === 200, `page 2 status ${page2.status}`);
  });
  await check("[db] product page has WhatsApp inquiry link and Product JSON-LD", async () => {
    const list = await (await fetch(`${BASE}/ar/products`)).text();
    const slug = list.match(/href="\/ar\/products\/([a-z0-9-]+)"/)?.[1];
    expect(slug, "no product found");
    const html = await (await fetch(`${BASE}/ar/products/${slug}`)).text();
    expect(html.includes('"@type":"Product"'), "no Product JSON-LD");
    expect(/(wa\.me|api\.whatsapp\.com)\/[^"]*text=/.test(html), "no WhatsApp link");
    expect(html.includes(encodeURIComponent("السلام عليكم")), "WhatsApp message not Arabic template");
  });
  await check("[db] unknown product renders the noindex 404 page", () => expectNotFound("/ar/products/this-product-does-not-exist"));
  await check("[db] unknown category renders the noindex 404 page", () => expectNotFound("/ar/categories/no-such-category"));
}

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
