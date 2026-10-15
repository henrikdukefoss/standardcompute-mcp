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

[![Add to Magpie](https://usemagpie.ai/img/add-to-magpie.svg)](https://usemagpie.ai/import#name=Standard+Compute&id=standardcompute&chat=https%3A%2F%2Fapi.stdcmpt.com%2Fv1&anthropic=https%3A%2F%2Fapi.stdcmpt.com&website=https%3A%2F%2Fstandardcompute.com&keys=https%3A%2F%2Fstandardcompute.com%2Fdashboard%2Fapi-keys&icon=https%3A%2F%2Fstandardcompute.com%2Fapple-icon.png)

Using Magpie? One click adds Standard Compute as a provider (you paste your key in Magpie). Guide: https://standardcompute.com/integrations/magpie

## Related guides

On standardcompute.com:

- [Getting started](https://standardcompute.com/getting-started): create a key and make the first request.
- [Claude Code setup](https://standardcompute.com/integrations/claude-code) and [OpenCode setup](https://standardcompute.com/integrations/opencode): using the gateway as the model provider in those clients, not only as an MCP server.
- [Models](https://standardcompute.com/models): the public catalog behind `list_models`.
- [Pricing](https://standardcompute.com/pricing): the plans that `plan_pricing` reports.

## Environment

- `STANDARDCOMPUTE_API_KEY` — from your [dashboard](https://standardcompute.com/dashboard); optional for `endpoint_health` and `plan_pricing`
- `STANDARDCOMPUTE_BASE_URL` — defaults to `https://api.stdcmpt.com/v1`

## License

MIT
