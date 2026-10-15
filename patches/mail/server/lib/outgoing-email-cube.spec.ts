import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createCubeStorage } from './cube-storage.js';
const { getStoredUpload } = vi.hoisted(() => ({ getStoredUpload: vi.fn() }));
vi.mock('./upload-store.js', () => ({ getStoredUpload }));
import { buildRawEmail, resolveComposeAttachments } from './outgoing-email.js';

describe('Cube uploaded email attachments', () => {
  let root: string;
  beforeEach(async () => {
    root = await mkdtemp(join(tmpdir(), 'cube-mail-attachment-'));
    vi.stubEnv('CUBE_APP_DATA_DIR', root);
  });
  afterEach(async () => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
    getStoredUpload.mockReset();
    await rm(root, { recursive: true, force: true });
  });
  async function resolve(data: Buffer) {
    const upload = await createCubeStorage(root).publicProvider.upload({ data, mimeType: 'text/plain', filename: 'note.txt' });
    getStoredUpload.mockResolvedValue({ filename: 'cube-test-missing.txt', originalName: 'note.txt', mimeType: 'text/plain', size: data.length, url: upload.url });
    return resolveComposeAttachments([{ filename: 'cube-test-missing.txt' }], 'test@example.com');
  }
  it('embeds durable upload bytes into an outgoing MIME attachment without HTTP', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    const data = Buffer.from('Durable Cube attachment');
    const attachments = await resolve(data);
    expect(attachments[0].data).toEqual(data);
    const mime = Buffer.from(buildRawEmail({ from: 'a@example.com', to: 'b@example.com', subject: 'Test', body: 'Attached', attachments }), 'base64url').toString();
    expect(mime).toContain(data.toString('base64'));
    expect(mime).toContain('note.txt');
    expect(fetchSpy).not.toHaveBeenCalled();
  });
  it('retains the 15 MiB attachment size limit', async () => {
    await expect(resolve(Buffer.alloc(15 * 1024 * 1024 + 1))).rejects.toThrow('Stored upload is too large to attach');
  });
  it('rejects traversal in local blob URLs without HTTP', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    getStoredUpload.mockResolvedValue({ url: '/api/cube-files/../../secret' });
    await expect(resolveComposeAttachments([{ filename: 'cube-test-missing.txt' }], 'test@example.com')).rejects.toThrow('Invalid Cube file id');
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
