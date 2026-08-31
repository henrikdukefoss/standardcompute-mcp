#!/usr/bin/env node
// standardcompute-mcp — MCP server exposing Standard Compute's endpoint to any
// MCP client. Read-only tools: model catalog, endpoint health, plan pricing.
// Env: STANDARDCOMPUTE_API_KEY (required for list_models),
//      STANDARDCOMPUTE_BASE_URL (default https://api.stdcmpt.com/v1)
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const BASE = (process.env.STANDARDCOMPUTE_BASE_URL || "https://api.stdcmpt.com/v1").replace(/\/$/, "");
const KEY = process.env.STANDARDCOMPUTE_API_KEY;

const server = new McpServer({ name: "standardcompute", version: "0.1.0" });
const text = (s) => ({ content: [{ type: "text", text: s }] });

server.tool(
  "list_models",
  "List the model ids the Standard Compute endpoint serves for your API key (GET /v1/models). Requires STANDARDCOMPUTE_API_KEY.",
  {},
  async () => {
    if (!KEY) return text("STANDARDCOMPUTE_API_KEY is not set. Get a key at https://standardcompute.com/dashboard and set the env var.");
    const res = await fetch(`${BASE}/models`, { headers: { authorization: `Bearer ${KEY}` }, signal: AbortSignal.timeout(15_000) });
    if (!res.ok) return text(`Endpoint returned HTTP ${res.status}: ${(await res.text()).slice(0, 300)}`);
    const body = await res.json();
    const ids = (body.data ?? []).map((m) => m.id);
    return text(`Models served (${ids.length}): ${ids.join(", ") || "(none)"}\nBase URL: ${BASE}`);
  },
);

server.tool(
  "endpoint_health",
  "Check that the Standard Compute endpoint is reachable and measure round-trip latency. Works without an API key (an auth error still proves reachability).",
  {},
  async () => {
    const t0 = Date.now();
    try {
      const res = await fetch(`${BASE}/models`, {
        headers: KEY ? { authorization: `Bearer ${KEY}` } : {},
        signal: AbortSignal.timeout(15_000),
      });
      const ms = Date.now() - t0;
      const reachable = res.ok || res.status === 401 || res.status === 403;
      return text(`Endpoint: ${BASE}\nReachable: ${reachable}\nHTTP status: ${res.status}${KEY ? "" : " (no API key set — 401/403 is expected and still means the endpoint is up)"}\nRound-trip: ${ms} ms`);
    } catch (e) {
      return text(`Endpoint: ${BASE}\nReachable: false\nError after ${Date.now() - t0} ms: ${e.message}`);
    }
  },
);

server.tool(
  "plan_pricing",
  "Fetch Standard Compute's current subscription plans and pricing (live from standardcompute.com/llms.txt — always current, never cached here).",
  {},
  async () => {
    const res = await fetch("https://standardcompute.com/llms.txt", { signal: AbortSignal.timeout(15_000) });
    if (!res.ok) return text(`Could not fetch pricing (HTTP ${res.status}). See https://standardcompute.com/pricing`);
    const body = await res.text();
    return text(`Live from standardcompute.com/llms.txt:\n\n${body.slice(0, 6000)}`);
  },
);

server.tool(
  "chat_probe",
  "Send one short test prompt through the endpoint to verify end-to-end completion works with your key. Uses few tokens.",
  { prompt: z.string().max(200).optional().describe("Optional short prompt; defaults to a one-word test") },
  async ({ prompt }) => {
    if (!KEY) return text("STANDARDCOMPUTE_API_KEY is not set — cannot run a completion probe.");
    const t0 = Date.now();
    const res = await fetch(`${BASE}/chat/completions`, {
      method: "POST",
      headers: { authorization: `Bearer ${KEY}`, "content-type": "application/json" },
      body: JSON.stringify({
        model: "standardcompute",
        max_tokens: 20,
        messages: [{ role: "user", content: prompt || "Reply with the single word: ok" }],
      }),
      signal: AbortSignal.timeout(60_000),
    });
    const ms = Date.now() - t0;
    if (!res.ok) return text(`HTTP ${res.status} after ${ms} ms: ${(await res.text()).slice(0, 300)}`);
    const body = await res.json();
    return text(`Completion OK in ${ms} ms.\nModel used: ${body.model ?? "?"}\nReply: ${body.choices?.[0]?.message?.content?.slice(0, 200) ?? "(empty)"}`);
  },
);

await server.connect(new StdioServerTransport());
