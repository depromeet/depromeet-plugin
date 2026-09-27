import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { captureSource } from './capture.js';
import { readOrCreateToken } from './local-auth.js';

const MAX_REQUEST = 60 * 1024 * 1024;

function send(response, status, value) {
  response.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store',
    'access-control-allow-origin': '*', 'access-control-allow-headers': 'content-type,x-h2f-token',
    'access-control-allow-methods': 'GET,POST,OPTIONS' });
  response.end(JSON.stringify(value));
}

async function bodyJson(request) {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > MAX_REQUEST) throw new Error('Request exceeds 60 MB');
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

export function createCaptureServer({ token }) {
  if (typeof token !== 'string' || !token) throw new Error('Server token is required');
  return createServer(async (request, response) => {
    if (request.method === 'OPTIONS') return send(response, 204, {});
    if (request.url === '/health' && request.method === 'GET') return send(response, 200, { ready: true });
    if (request.url !== '/capture' || request.method !== 'POST') return send(response, 404, { error: 'Not found' });
    if (request.headers['x-h2f-token'] !== token) return send(response, 401, { error: 'Invalid connection token' });
    try {
      const input = await bodyJson(request);
      const capture = await captureSource(input.source);
      send(response, 200, capture);
    } catch (error) {
      send(response, 400, { error: error instanceof Error ? error.message : 'Capture failed' });
    }
  });
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
  const token = await readOrCreateToken(root);
  const server = createCaptureServer({ token });
  server.listen(4179, 'localhost', () => {
    console.log('HTML → Figma capture service: http://localhost:4179');
  });
}
