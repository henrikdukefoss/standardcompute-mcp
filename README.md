# standardcompute-mcp

An [MCP](https://modelcontextprotocol.io) server for [Standard Compute](https://standardcompute.com) — check the endpoint, list your models, and read current plan pricing from inside any MCP client.

## Tools

| Tool | What it does | Needs API key |
|---|---|---|
| `endpoint_health` | Reachability + round-trip latency for the API endpoint | no |
| `plan_pricing` | Current plans/pricing, fetched live from standardcompute.com/llms.txt | no |
| `list_models` | Model ids your key can access (`GET /v1/models`) | yes |
| `chat_probe` | One tiny end-to-end completion to verify your key works | yes |

All tools are read-only apart from `chat_probe`, which sends a single ~20-token completion.

## Setup

```bash
git clone https://github.com/henrikdukefoss/standardcompute-mcp
cd standardcompute-mcp && npm install
```

**Claude Code:**

```bash
claude mcp add standardcompute -e STANDARDCOMPUTE_API_KEY=your-key -- node /path/to/standardcompute-mcp/src/index.js
```

**Claude Desktop** (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "standardcompute": {
      "command": "node",
      "args": ["/path/to/standardcompute-mcp/src/index.js"],
      "env": { "STANDARDCOMPUTE_API_KEY": "your-key" }
    }
  }
}
```

**opencode** (`opencode.json`):

```json
{
  "mcp": {
    "standardcompute": {
      "type": "local",
      "command": ["node", "/path/to/standardcompute-mcp/src/index.js"],
      "environment": { "STANDARDCOMPUTE_API_KEY": "your-key" }
    }
  }
}
```

## Environment

- `STANDARDCOMPUTE_API_KEY` — from your [dashboard](https://standardcompute.com/dashboard); optional for `endpoint_health` and `plan_pricing`
- `STANDARDCOMPUTE_BASE_URL` — defaults to `https://api.stdcmpt.com/v1`

## License

MIT
