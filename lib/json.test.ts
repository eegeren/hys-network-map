import assert from "node:assert/strict";
import test from "node:test";
import { jsonResponse, serializeForJson } from "./json";

test("serializes nested Prisma BigInt values as strings", () => {
  const result = serializeForJson({
    id: "device-1",
    uptime: BigInt(345600),
    nested: [{ value: BigInt(1) }],
  });
  assert.deepEqual(result, {
    id: "device-1",
    uptime: "345600",
    nested: [{ value: "1" }],
  });
});

test("creates a devices JSON response and keeps an unassigned device", async () => {
  const response = jsonResponse({
    items: [
      { id: "device-1", uptime: BigInt(345600), storeId: null, store: null },
    ],
    total: 1,
    page: 1,
    pages: 1,
  });
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    items: [{ id: "device-1", uptime: "345600", storeId: null, store: null }],
    total: 1,
    page: 1,
    pages: 1,
  });
});
