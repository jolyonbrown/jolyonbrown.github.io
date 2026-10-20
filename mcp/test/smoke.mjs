// Smoke test: runs the worker in Node against a local site.json.
//   cd .. && hugo -d /tmp/site && cd mcp && SITE_JSON=/tmp/site/site.json npm test
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import worker from '../src/index.js';

const sitePath = process.env.SITE_JSON || new URL('../../public/site.json', import.meta.url).pathname;
const siteJson = await readFile(sitePath, 'utf8');
globalThis.fetch = async () => new Response(siteJson, { headers: { 'Content-Type': 'application/json' } });

const env = { SITE_DATA_URL: 'https://example.test/site.json' };
let id = 0;
async function rpc(method, params, { notify = false } = {}) {
  const msg = { jsonrpc: '2.0', method, ...(params && { params }), ...(!notify && { id: ++id }) };
  const res = await worker.fetch(new Request('https://mcp.test/mcp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json, text/event-stream' },
    body: JSON.stringify(msg),
  }), env);
  return { status: res.status, body: res.status === 202 ? null : await res.json() };
}
const call = async (name, args) => JSON.parse((await rpc('tools/call', { name, arguments: args })).body.result.content[0].text);

let r = await rpc('initialize', { protocolVersion: '2025-06-18', capabilities: {}, clientInfo: { name: 'smoke', version: '0' } });
assert.equal(r.body.result.protocolVersion, '2025-06-18');
assert.ok(r.body.result.capabilities.tools);
r = await rpc('initialize', { protocolVersion: '1999-01-01', capabilities: {}, clientInfo: { name: 'smoke', version: '0' } });
assert.equal(r.body.result.protocolVersion, '2025-11-25', 'unknown versions get our latest');

r = await rpc('notifications/initialized', undefined, { notify: true });
assert.equal(r.status, 202);

r = await rpc('tools/list');
const names = r.body.result.tools.map((t) => t.name);
assert.deepEqual(names, ['get_profile', 'get_experience', 'get_strengths_and_gaps', 'get_projects', 'get_writing', 'search']);
assert.ok(r.body.result.tools.every((t) => t.inputSchema && !('run' in t)));

const profile = await call('get_profile', {});
assert.equal(profile.profile.name, 'Jolyon Brown');
assert.ok(profile.plan.text.length > 0);

const nhs = await call('get_experience', { organisation: 'nhs' });
assert.equal(nhs.experience.length, 1);
assert.match(nhs.experience[0].org, /NHS/);

const all = await call('get_experience', {});
assert.ok(all.experience.length >= 5 && all.education.length >= 1);

const sg = await call('get_strengths_and_gaps', {});
assert.ok(sg.self_assessment.gaps.length > 0, 'gaps must be exposed');

assert.ok((await call('get_projects', {})).projects.length > 0);
assert.ok((await call('get_writing', {})).posts.length > 0);

const found = await call('search', { query: 'kubernetes' });
assert.ok(found.count > 0);
console.log(`search "kubernetes": ${found.count} matches, e.g. ${found.matches[0].path}`);

r = await rpc('tools/call', { name: 'search', arguments: { query: 'k' } });
assert.equal(r.body.error.code, -32602);
r = await rpc('tools/call', { name: 'nope', arguments: {} });
assert.equal(r.body.error.code, -32602);
r = await rpc('no/such/method');
assert.equal(r.body.error.code, -32601);

r = await rpc('prompts/get', { name: 'assess_fit', arguments: { job_description: 'Platform engineer, AWS' } });
assert.match(r.body.result.messages[0].content.text, /Platform engineer, AWS/);

r = await rpc('resources/read', { uri: 'jolyon://plan' });
assert.match(r.body.result.contents[0].text, /Plan updated/);

r = await rpc('ping');
assert.deepEqual(r.body.result, {});

// HTTP edges
let res = await worker.fetch(new Request('https://mcp.test/mcp'), env);
assert.equal(res.status, 405);
res = await worker.fetch(new Request('https://mcp.test/mcp', { method: 'POST', body: '{nope' }), env);
assert.equal(res.status, 400);
assert.equal((await res.json()).error.code, -32700);
res = await worker.fetch(new Request('https://mcp.test/'), env);
assert.equal(res.status, 200);
res = await worker.fetch(new Request('https://mcp.test/mcp', { method: 'OPTIONS' }), env);
assert.equal(res.headers.get('Access-Control-Allow-Origin'), '*');

console.log('MCP smoke test passed');
