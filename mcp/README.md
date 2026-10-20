# jolyon-mcp

A read-only [MCP](https://modelcontextprotocol.io) server with my CV, projects and writing, running as a Cloudflare Worker. It replaces the old chatbot: visitors connect their own AI client, so there's no model, no API key and no AI bill here.

It reads `https://jolyonbrown.com/site.json`, which Hugo builds from `data/cv.yaml`, `data/projects.yaml`, `data/administeria.yaml`, the posts and the .plan. Edit those, push, and the server picks up the changes within five minutes. Nothing in this folder needs to change.

## What it offers

- **Tools:** `get_profile`, `get_experience` (optional `organisation` filter), `get_strengths_and_gaps`, `get_projects`, `get_writing`, `search`
- **Prompt:** `assess_fit` (takes a `job_description`)
- **Resources:** `jolyon://site.json`, `jolyon://plan`

The transport is stateless Streamable HTTP at `POST /mcp`, answered with plain JSON (no SSE, no sessions).

## Deploy

```sh
cd mcp
npm install
npx wrangler login     # first time only
npm run deploy
```

That gives you `https://jolyon-mcp.<your-subdomain>.workers.dev/mcp`. If it's not `jolyon-ea8`, update `params.mcpEndpoint` in `../hugo.toml`.

For `mcp.jolyonbrown.com` instead, the domain's DNS has to be on Cloudflare. Uncomment `routes` in `wrangler.toml`, deploy, and update `params.mcpEndpoint`.

## Test

```sh
cd .. && hugo -d /tmp/site && cd mcp
SITE_JSON=/tmp/site/site.json npm test
```

Or try it in Claude Code: `claude mcp add --transport http jolyon https://jolyon-mcp.jolyon-ea8.workers.dev/mcp`

## Cost and abuse

It's read-only public data with no model behind it, so the worst case is someone using up the Workers free tier (100,000 requests a day), and requests just fail after that. If that ever happens, add a Cloudflare rate-limiting rule on the route.
