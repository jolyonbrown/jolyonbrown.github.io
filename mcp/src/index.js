// Read-only MCP server for jolyonbrown.com.
//
// Speaks MCP's Streamable HTTP transport, statelessly: every request is a single
// JSON-RPC message POSTed to /mcp and answered with plain JSON (no SSE, no sessions).
// All data comes from the site's own /site.json, which Hugo builds from data/cv.yaml,
// data/projects.yaml and the posts - so updating the site updates this server.
// No AI model runs here: the visitor's own client does the thinking.

const SERVER_INFO = { name: 'jolyonbrown-cv', title: "Jolyon Brown's CV", version: '1.0.0' };
const SUPPORTED_VERSIONS = ['2025-11-25', '2025-06-18', '2025-03-26', '2024-11-05'];
const CACHE_SECONDS = 300;

const INSTRUCTIONS = `Read-only information about Jolyon Brown (Forward Deployed Engineer, UK): his CV, \
honest self-assessment, projects, writing and current .plan status. Start with get_profile. \
To judge fit for a role, call get_experience and get_strengths_and_gaps, then be honest - \
Jolyon would rather you point out gaps than oversell him. Only state what the data supports.`;

const READ_ONLY = { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false };
const NO_ARGS = { type: 'object', properties: {}, additionalProperties: false };

const TOOLS = [
  {
    name: 'get_profile',
    title: 'Profile',
    description: "Jolyon's headline, summary, contact details, what he's looking for, and his current .plan status.",
    inputSchema: NO_ARGS,
    annotations: READ_ONLY,
    run: (d) => ({ profile: d.profile, plan: d.plan, site: d.site }),
  },
  {
    name: 'get_experience',
    title: 'Experience',
    description: 'Career history, most recent first: organisation, role, dates, summary, highlights and technologies. Optionally filter by organisation name.',
    inputSchema: {
      type: 'object',
      properties: {
        organisation: { type: 'string', description: 'Case-insensitive part of an organisation name, e.g. "NHS" or "TSYS".' },
      },
      additionalProperties: false,
    },
    annotations: READ_ONLY,
    run: (d, args) => {
      const q = (args.organisation || '').trim().toLowerCase();
      const roles = q ? d.experience.filter((e) => e.org.toLowerCase().includes(q)) : d.experience;
      return { experience: roles, education: q ? undefined : d.education };
    },
  },
  {
    name: 'get_strengths_and_gaps',
    title: 'Strengths and gaps',
    description: "Jolyon's honest self-assessment (strong / moderate / gaps), his full technical skills list, and worked examples of roles he does and doesn't fit. Use this when assessing fit for a job.",
    inputSchema: NO_ARGS,
    annotations: READ_ONLY,
    run: (d) => ({ self_assessment: d.self_assessment, skills: d.skills, fit_examples: d.fit_examples }),
  },
  {
    name: 'get_projects',
    title: 'Projects',
    description: 'Personal projects with their status (idea, building, shipped, ongoing, abandoned) and links.',
    inputSchema: NO_ARGS,
    annotations: READ_ONLY,
    run: (d) => ({ projects: d.projects }),
  },
  {
    name: 'get_writing',
    title: 'Writing',
    description: 'Blog posts on jolyonbrown.com (title, date, URL, tags, summary) and his Linux Format "Administeria" column topics, 2014-2017.',
    inputSchema: NO_ARGS,
    annotations: READ_ONLY,
    run: (d) => ({ posts: d.posts, publications: d.publications, administeria: d.administeria }),
  },
  {
    name: 'search',
    title: 'Search',
    description: 'Search everything (CV, skills, projects, posts, plan) for a word or phrase. Returns matching snippets and where they came from.',
    inputSchema: {
      type: 'object',
      properties: { query: { type: 'string', minLength: 2, description: 'Word or phrase, e.g. "Kubernetes" or "PCI".' } },
      required: ['query'],
      additionalProperties: false,
    },
    annotations: READ_ONLY,
    run: (d, args) => {
      const query = String(args.query || '').trim();
      if (query.length < 2) throw new RpcError(-32602, 'query must be at least 2 characters');
      const matches = search(d, query.toLowerCase()).slice(0, 25);
      return { query, count: matches.length, matches };
    },
  },
];

const PROMPTS = [
  {
    name: 'assess_fit',
    title: 'Assess fit for a role',
    description: 'Honestly assess whether Jolyon is a good fit for a job description.',
    arguments: [{ name: 'job_description', description: 'The job description to assess', required: true }],
  },
];

const RESOURCES = [
  { uri: 'jolyon://site.json', name: 'site.json', title: 'All site data', description: 'CV, projects and posts as JSON', mimeType: 'application/json' },
  { uri: 'jolyon://plan', name: 'plan', title: '.plan', description: "Jolyon's current status, Unix .plan style", mimeType: 'text/plain' },
];

class RpcError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
  }
}

// ── Data ──────────────────────────────────────────────

let cached = null; // { data, at }

async function loadData(env) {
  if (cached && Date.now() - cached.at < CACHE_SECONDS * 1000) return cached.data;
  const url = env.SITE_DATA_URL || 'https://jolyonbrown.com/site.json';
  const res = await fetch(url, { cf: { cacheTtl: CACHE_SECONDS, cacheEverything: true } });
  if (!res.ok) throw new Error(`Couldn't load ${url}: HTTP ${res.status}`);
  const data = await res.json();
  cached = { data, at: Date.now() };
  return data;
}

function search(data, q) {
  const sections = ['profile', 'plan', 'experience', 'skills', 'self_assessment', 'fit_examples', 'projects', 'posts', 'administeria', 'publications', 'education'];
  const out = [];
  const walk = (value, path) => {
    if (typeof value === 'string') {
      const i = value.toLowerCase().indexOf(q);
      if (i !== -1) {
        const start = Math.max(0, i - 80);
        const end = Math.min(value.length, i + q.length + 80);
        out.push({ path, snippet: (start ? '…' : '') + value.slice(start, end) + (end < value.length ? '…' : '') });
      }
    } else if (Array.isArray(value)) {
      value.forEach((v, i) => walk(v, `${path}[${i}]`));
    } else if (value && typeof value === 'object') {
      for (const [k, v] of Object.entries(value)) walk(v, `${path}.${k}`);
    }
  };
  for (const s of sections) walk(data[s], s);
  return out;
}

// ── JSON-RPC ──────────────────────────────────────────

async function handleMessage(msg, env) {
  const { method, params = {} } = msg;
  switch (method) {
    case 'initialize': {
      const requested = params.protocolVersion;
      return {
        protocolVersion: SUPPORTED_VERSIONS.includes(requested) ? requested : SUPPORTED_VERSIONS[0],
        capabilities: { tools: { listChanged: false }, prompts: { listChanged: false }, resources: { listChanged: false } },
        serverInfo: SERVER_INFO,
        instructions: INSTRUCTIONS,
      };
    }
    case 'ping':
      return {};
    case 'tools/list':
      return { tools: TOOLS.map(({ run, ...tool }) => tool) };
    case 'tools/call': {
      const tool = TOOLS.find((t) => t.name === params.name);
      if (!tool) throw new RpcError(-32602, `Unknown tool: ${params.name}`);
      let result;
      try {
        result = tool.run(await loadData(env), params.arguments || {});
      } catch (err) {
        if (err instanceof RpcError) throw err;
        return { content: [{ type: 'text', text: `Error: ${err.message}` }], isError: true };
      }
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    }
    case 'prompts/list':
      return { prompts: PROMPTS };
    case 'prompts/get': {
      if (params.name !== 'assess_fit') throw new RpcError(-32602, `Unknown prompt: ${params.name}`);
      const jd = params.arguments?.job_description;
      if (!jd) throw new RpcError(-32602, 'job_description is required');
      return {
        description: PROMPTS[0].description,
        messages: [{
          role: 'user',
          content: {
            type: 'text',
            text: `Using the jolyonbrown-cv tools (get_experience and get_strengths_and_gaps at least), assess honestly whether Jolyon Brown is a good fit for the role below. Give an overall verdict (strong, moderate or not a fit), where he fits, the gaps, and a recommendation. Don't oversell; only claim what his data supports.\n\nJob description:\n${jd}`,
          },
        }],
      };
    }
    case 'resources/list':
      return { resources: RESOURCES };
    case 'resources/read': {
      const data = await loadData(env);
      if (params.uri === 'jolyon://site.json') {
        return { contents: [{ uri: params.uri, mimeType: 'application/json', text: JSON.stringify(data, null, 2) }] };
      }
      if (params.uri === 'jolyon://plan') {
        return { contents: [{ uri: params.uri, mimeType: 'text/plain', text: `Plan updated: ${data.plan.updated}\n\n${data.plan.text}` }] };
      }
      throw new RpcError(-32602, `Unknown resource: ${params.uri}`);
    }
    default:
      throw new RpcError(-32601, `Method not found: ${method}`);
  }
}

async function respond(msg, env) {
  const isValid = msg && typeof msg === 'object' && !Array.isArray(msg) && msg.jsonrpc === '2.0' && typeof msg.method === 'string';
  if (!isValid) {
    // A response or other non-request message from the client: nothing to answer.
    if (msg && typeof msg === 'object' && ('result' in msg || 'error' in msg)) return null;
    return { jsonrpc: '2.0', id: msg?.id ?? null, error: { code: -32600, message: 'Invalid request' } };
  }
  const isNotification = !('id' in msg);
  try {
    const result = await handleMessage(msg, env);
    return isNotification ? null : { jsonrpc: '2.0', id: msg.id, result };
  } catch (err) {
    if (isNotification) return null;
    const code = err instanceof RpcError ? err.code : -32603;
    return { jsonrpc: '2.0', id: msg.id, error: { code, message: err.message } };
  }
}

// ── HTTP ──────────────────────────────────────────────

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Accept, Mcp-Protocol-Version, Mcp-Session-Id, Last-Event-ID',
  'Access-Control-Max-Age': '86400',
};

function json(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', ...CORS } });
}

const HELP = `This is a read-only MCP server with Jolyon Brown's CV, projects and writing.

Connect an MCP client to: POST /mcp (Streamable HTTP)

  Claude Code:  claude mcp add --transport http jolyon https://<this-host>/mcp

More: https://jolyonbrown.com/cv/#ask-your-agent
`;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });

    if (url.pathname !== '/mcp') {
      if (request.method === 'GET' && url.pathname === '/') {
        return new Response(HELP, { headers: { 'Content-Type': 'text/plain; charset=utf-8', ...CORS } });
      }
      return new Response('Not found', { status: 404, headers: CORS });
    }

    // No server-initiated SSE stream and no sessions to delete.
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405, headers: { Allow: 'POST, OPTIONS', ...CORS } });
    }

    if (Number(request.headers.get('Content-Length') || 0) > 64 * 1024) {
      return json({ jsonrpc: '2.0', id: null, error: { code: -32600, message: 'Request too large' } }, 413);
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return json({ jsonrpc: '2.0', id: null, error: { code: -32700, message: 'Parse error' } }, 400);
    }

    // Older clients may send a batch (2025-03-26); answer each request in it.
    if (Array.isArray(body)) {
      if (body.length === 0 || body.length > 20) {
        return json({ jsonrpc: '2.0', id: null, error: { code: -32600, message: 'Invalid batch' } }, 400);
      }
      const replies = (await Promise.all(body.map((m) => respond(m, env)))).filter(Boolean);
      return replies.length ? json(replies) : new Response(null, { status: 202, headers: CORS });
    }

    const reply = await respond(body, env);
    if (!reply) return new Response(null, { status: 202, headers: CORS });
    return json(reply, reply.error?.code === -32600 ? 400 : 200);
  },
};
