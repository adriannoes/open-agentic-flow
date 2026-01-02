# Project Roadmap & Technical Debt

> **Note:** This is an **exploratory** "build in public" project primarily aimed at developer workflows. It is not the official, supported Pipefy orchestration platform for enterprise clients.

## 🚀 Architecture & Integration Strategy

### Hybrid Stack
- **Frontend/Orchestration:** Next.js 16 + Supabase (App Router, Visual Builder, State Management).
- **Agent Runtime & Integration:** Python.
  - We leverage the ecosystem of Python-based MCP servers for robust integrations.
  - Specifically, the **[Pipefy MCP Server](https://github.com/gbrlcustodio/pipefy-mcp-server)** is the core integration layer.

### Pipefy MCP & AI Agents
We are integrating two key Pipefy technologies:
1.  **Pipefy MCP Server (Python):**
    - **Repository:** `https://github.com/gbrlcustodio/pipefy-mcp-server`
    - **Role:** Exposes granular Pipefy product actions (Cards, Fields, Tables, Pipes) as standard MCP tools.
    - **Goal:** Enable the orchestration engine to "speak" directly to Pipefy without custom API wrappers.
2.  **Pipefy AI Agents 2.0:**
    - **Docs:** [AI Agent 2.0 Guide](https://help.pipefy.com/en/articles/12526171-ai-agent-2-0-create-the-new-ai-agent)
    - **Role:** Orchestrate specific, high-level agents created within Pipefy's ecosystem from our visual builder.

## 📝 TODO List

### 🎨 Branding & Identity (COMPLETED ✅)
- [x] **Remove v0 References:** Updated `package.json` name to "open-agent-flow"
- [x] **Rewrite README:** Created independent README without v0.app references
- [x] **Clean Code Comments:** Removed "[v0]" prefix from logs and comments

### 🔌 Pipefy Core Integration (Priority)
- [ ] **Python MCP Runtime Env:** Set up a local/dockerized Python environment to run `pipefy-mcp-server`.
- [ ] **Connect Pipefy MCP:** Configure the Next.js app to connect to the local/remote `pipefy-mcp-server` via stdio or SSE.
- [ ] **Map Tools:** Verify that actions like `create_card`, `move_card`, `update_field` are correctly discovered by the MCP Client (`lib/mcp/client.ts`).
- [ ] **Agent 2.0 Node:** Create a specialized node type in the builder to trigger Pipefy AI Agents 2.0 via API/Webhook.

### 🛠 Technical Debt (Cleanup)
- [ ] **MCP Real Implementation:** Current `lib/mcp-client.ts` is mocked. Implement actual HTTP/STDIO communication with MCP servers (see [MCP Spec](https://modelcontextprotocol.io)).
  - [ ] Implement real HTTP transport for MCP servers
  - [ ] Implement STDIO transport for local MCP servers  
  - [ ] Add connection state management and reconnection logic
  - [ ] Replace mock tool responses with actual MCP protocol calls
- [ ] **Remove Mock Data:** `lib/store.ts` contains in-memory mock data. Fully migrate `AgentsDashboard` and `Playground` to fetch data from Supabase.
- [ ] **Strict Typing:** Review `lib/workflow-executor.ts` and replace usage of `any` with strict Zod schemas or TypeScript interfaces.
- [ ] **Error Handling:** Implement global error boundary and better toast notifications for backend failures.
- [ ] **Testing:** Add unit tests for `WorkflowExecutor` and e2e tests for the Builder.

### ⚡ Orchestration & Reliability
- [ ] **Webhooks:** Create an endpoint to receive Pipefy webhooks (`/api/webhooks/pipefy`) to trigger workflows (e.g., "When card moves to phase X").
- [ ] **Queue System:** For long-running agents, implement a job queue (e.g., BullMQ or Inngest).
- [ ] **Resilience:** Add retry logic for AI calls and external API requests.
- [ ] **Guardrails:** Implement the safety layer nodes (PII, Jailbreak).

### 🎨 UX Improvements
- [ ] **Realtime Collaboration:** Enable multiple users to edit a workflow simultaneously (using Supabase Realtime).
- [ ] **Mini-map:** Add a mini-map to the Builder canvas for large workflows.

## 🚀 Deployment Strategy
**Recommended:** Vercel + Supabase
- **Vercel:** Handles Frontend, API Routes, and Edge Functions.
- **Supabase:** Managed PostgreSQL, Auth, and Realtime subscriptions.
- **MCP Host:** The Python MCP server will need a runtime environment (e.g., Railway, Render, or a sidecar container if self-hosting).
