import { mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { getCubeStorage } from './cube-storage.js';
import { embedCubeImagesInHtml, renderDesignToFigmaSvg } from './design-to-figma-svg.js';

const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a4xkAAAAASUVORK5CYII=', 'base64');
let root: string;
beforeEach(async () => {
  root = await mkdtemp(path.join(os.tmpdir(), 'cube-design-svg-'));
  vi.stubEnv('CUBE_APP_DATA_DIR', root);
});
afterEach(async () => { vi.unstubAllEnvs(); await rm(root, { recursive: true, force: true }); });

it('embeds real Cube uploads in image elements and CSS backgrounds before rendering SVG', async () => {
  const uploaded = await getCubeStorage().publicProvider.upload({ data: png, mimeType: 'image/png', filename: 'pixel.png' });
  const result = await renderDesignToFigmaSvg({
    html: `<html><body style="margin:0"><img src="${uploaded.url}" width="20" height="20"><div style="width:20px;height:20px;background-image:url('${uploaded.url}')"></div></body></html>`,
    width: 100, height: 100, embedImages: true,
  });
  expect(result.svg).toContain(`data:image/png;base64,${png.toString('base64')}`);
  expect(result.svg.split(png.toString('base64')).length - 1).toBeGreaterThanOrEqual(2);
  expect(result.svg).not.toContain(uploaded.url);
  expect(result.report.omitted).toEqual([]);
}, 30000);

it('does not treat remote URLs or malformed local paths as Cube uploads', async () => {
  const uploaded = await getCubeStorage().publicProvider.upload({ data: png, mimeType: 'image/png', filename: 'pixel.png' });
  const urls = [`https://example.com${uploaded.url}`, `//example.com${uploaded.url}`, `${uploaded.url}?token=x`, `${uploaded.url}/extra`, '/api/cube-files/../../secret', '/api/cube-files/%2e%2e%2fsecret'];
  for (const url of urls) {
    const html = `<img src="${url}">`;
    expect(await embedCubeImagesInHtml(html)).toBe(html);
  }
});

it('refuses an uploaded non-image instead of embedding active HTML', async () => {
  const uploaded = await getCubeStorage().publicProvider.upload({ data: Buffer.from('<script>bad()</script>'), mimeType: 'text/html', filename: 'not-image.html' });
  await expect(embedCubeImagesInHtml(`<img src="${uploaded.url}">`)).rejects.toThrow('not an image');
});
