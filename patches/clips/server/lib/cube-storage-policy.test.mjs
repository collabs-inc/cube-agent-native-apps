import assert from 'node:assert/strict';
import { test } from 'node:test';
import { allowsCubeRecordingScratch } from './cube-storage-policy.ts';

test('permits buffered recording scratch for durable Cube PGlite', () => {
  assert.equal(allowsCubeRecordingScratch('pglite:/persist/data/pglite', { CUBE_APP_DATA_DIR: '/persist' }), true);
});

test('retains hosted and non-Cube restrictions', () => {
  for (const [url, env] of [
    ['postgres://host/db', { CUBE_APP_DATA_DIR: '/persist' }],
    ['pglite:./data/pglite', {}],
    ['pglite:./data/pglite', { CUBE_APP_DATA_DIR: 'relative' }],
    ['', { CUBE_APP_DATA_DIR: '/persist' }],
    ['pglite:memory://', { CUBE_APP_DATA_DIR: '/persist' }],
  ]) assert.equal(allowsCubeRecordingScratch(url, env), false);
});
