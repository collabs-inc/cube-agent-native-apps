import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createCubeStorage } from "./cube-storage.ts";

test("files persist across adapter instances with stable URLs and safe names", async () => {
  const root = await mkdtemp(join(tmpdir(), "cube-storage-"));
  try {
    const first = createCubeStorage(root);
    const result = await first.publicProvider.upload({
      data: Buffer.from("hello"),
      filename: "../../escape.html",
      mimeType: "text/plain",
    });
    assert.match(result.url, /^\/api\/cube-files\/[a-f0-9-]+$/);
    const second = createCubeStorage(root);
    const stored = await second.readPublic(result.id!);
    assert.equal(stored.data.toString(), "hello");
    assert.equal(stored.mimeType, "text/plain");
    assert.equal(await second.publicProvider.isOwnedUrl!(result.url), true);
    await assert.rejects(() => second.readPublic("../secret"));
    assert.equal(await second.publicProvider.delete!({ url: result.url }), true);
    await assert.rejects(() => second.readPublic(result.id!));
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("private blobs are opaque, persist metadata, and cannot be read through public storage", async () => {
  const root = await mkdtemp(join(tmpdir(), "cube-storage-"));
  try {
    const storage = createCubeStorage(root);
    const handle = await storage.privateProvider.put({
      data: Buffer.from("private"),
      mimeType: "text/plain",
      metadata: { source: "test" },
    });
    assert.equal(handle.opaque, true);
    assert.equal(handle.encrypted, false);
    const read = await createCubeStorage(root).privateProvider.read(handle);
    assert.equal(Buffer.from(read.data).toString(), "private");
    assert.deepEqual(read.metadata, { source: "test" });
    await assert.rejects(() => storage.readPublic(handle.id));
    await assert.rejects(() => storage.privateProvider.read({ ...handle, id: "../../secret" }));
    assert.equal((await storage.privateProvider.delete(handle)).deleted, true);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
