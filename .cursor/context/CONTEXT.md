# Open Agent Flow - Project Context & Status

## 🚀 Project Overview
**Open Agent Flow** is an advanced **Agent Studio** designed to orchestrate AI agents and integrate them seamlessly with **Pipefy**. It features a visual workflow builder, a powerful execution engine, and a robust connector registry, currently evolving to become a comprehensive orchestration platform.

## ✅ Completed Features

> **Status Legend:**
> - ✅ **Implemented & Production-Ready**
> - ⚠️ **Implemented but Mock/In-Memory** (needs backend integration)
> - 🚧 **Planned** (see TODO.md)

### 1. Visual Workflow Builder
- **Interactive Canvas:** Drag-and-drop interface for building agent workflows.
- **Node Types:** Agent, Guardrail, Condition, MCP Tool, User Approval, File Search, Start/End.
- **Advanced Features:**
  - **Auto-layout:** Hierarchical organization of nodes.
  - **Undo/Redo:** Full history management.
  - **Clipboard:** Copy/paste support with keyboard shortcuts.
  - **Export/Import:** JSON-based workflow sharing.
- **UI/UX:** Premium design inspired by Vercel/Linear, with smooth transitions and micro-interactions.

### 2. Execution Engine
- **Node-by-Node Execution:** Real-time processing of workflow steps.
- **AI Integration:** Direct calls to LLMs via Vercel AI SDK.
- **Monitoring:** Real-time execution logs, status tracking (pending/running/completed/failed), and node highlighting.
- **History:** Comprehensive execution history.

### 3. Version Control
- **Versioning:** Save, restore, and tag workflow versions.
- **Comparison:** Diff viewer for workflow changes.

### 4. Connector Registry & MCP ⚠️
- **MCP Integration:** Full support for Model Context Protocol (MCP) servers (HTTP & STDIO).
  - ⚠️ **Note:** Current implementation uses mock responses for tool calls. Real MCP server integration pending (see TODO.md).
- **Tool Discovery:** Automatic capability discovery for connected MCP servers.
- **Marketplace:** Integration marketplace with pre-loaded connectors (Salesforce, HubSpot, etc.).
- **Auth Management:** OAuth 2.0 flow with PKCE, API Key management.

### 5. Backend & Data
- **Supabase Integration:** Full database schema for agents, workflows, executions, and connectors.
- **Multi-tenancy:** Workspace-based architecture with RLS policies.

## ⚠️ Known Limitations & Technical Debt

- **Mock MCP Client:** `lib/mcp-client.ts` returns simulated responses instead of making real MCP protocol calls. See TODO.md for implementation roadmap.
- **In-Memory Store:** `lib/store.ts` uses in-memory mock data for agents/tools. Migration to Supabase in progress.

## 🚧 Current Roadmap & To-Do

### Phase 1: Neutralization & Branding (Immediate)
- Remove all "v0" branding and references.
- Rebrand details to "Open Agent Flow".
- Update documentation to reflect the independent nature of the project.

### Phase 2: Pipefy Integration (Core Goal)
- **Kanban Integration:** Connect agents to Pipefy pipes.
- **Trigger System:** Listen to Pipefy webhooks/events to start workflows.
- **Action Nodes:** Create specific nodes for Pipefy actions (Create Card, Move Card, Update Field).

### Phase 3: Advanced Orchestration
- **Guardrails:** Implement safety layers (PII masking, Jailbreak detection).
- **Evaluations:** System for grading agent performance.
- **Parallel Execution:** Support for branching parallel flows.

## 🛠 Tech Stack
- **Frontend:** Next.js 16 (App Router), React 19, TailwindCSS 4.
- **Backend:** Supabase (PostgreSQL, Auth, Realtime).
- **AI:** Vercel AI SDK.
- **Integration:** MCP (Model Context Protocol).

## 📄 Documentation
- `historico.md`: Raw log of development decisions (v0 era).
- `SUPABASE_SETUP.md`: Database setup instructions.
- `README.md`: Public-facing project documentation.
