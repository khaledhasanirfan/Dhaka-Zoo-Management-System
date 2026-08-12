import assert from "node:assert/strict";
import { after, before, test } from "node:test";

const trustedOrigin = "https://dhaka-zoo-management-system.vercel.app";
let baseUrl;
let server;

before(async () => {
  process.env.DATABASE_URL ||= "postgresql://postgres:postgres@127.0.0.1:5432/dhaka_zoo_test";
  process.env.JWT_SECRET ||= "local-test-secret-that-is-never-used-in-production";
  process.env.NODE_ENV = "test";

  const { app } = await import("../index.js");
  await new Promise((resolve) => {
    server = app.listen(0, "127.0.0.1", resolve);
  });

  const address = server.address();
  baseUrl = `http://127.0.0.1:${address.port}`;
});

after(async () => {
  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
});

test("health responses include defensive headers", async () => {
  const response = await fetch(`${baseUrl}/api/health`);

  assert.equal(response.status, 200);
  assert.equal(response.headers.get("x-content-type-options"), "nosniff");
  assert.equal(response.headers.get("x-frame-options"), "DENY");
  assert.match(response.headers.get("content-security-policy"), /default-src 'none'/);
});

test("CORS permits the production Vercel origin", async () => {
  const response = await fetch(`${baseUrl}/api/health`, {
    headers: { Origin: trustedOrigin },
  });

  assert.equal(response.status, 200);
  assert.equal(response.headers.get("access-control-allow-origin"), trustedOrigin);
});

test("CORS rejects untrusted browser origins", async () => {
  const response = await fetch(`${baseUrl}/api/health`, {
    headers: { Origin: "https://malicious.example" },
  });

  assert.equal(response.status, 403);
  assert.deepEqual(await response.json(), { message: "Origin is not allowed by CORS." });
});

test("ticket validation requires an authenticated staff account", async () => {
  const response = await fetch(`${baseUrl}/api/tickets/validate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ qrCode: "DZ-TEST" }),
  });

  assert.equal(response.status, 401);
  assert.deepEqual(await response.json(), { message: "Authentication token is required." });
});
