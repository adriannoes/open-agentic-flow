# Open Agent Flow

An advanced **Agent Studio** designed to orchestrate AI agents and integrate them seamlessly with external platforms. Build, test, and deploy sophisticated AI agent workflows with a visual workflow builder, powerful execution engine, and extensible connector registry.

## 🚀 Features

### Visual Workflow Builder
- Interactive drag-and-drop canvas for building agent workflows
- Multiple node types: Agent, Guardrail, Condition, MCP Tool, User Approval, File Search
- Auto-layout, undo/redo, copy/paste with keyboard shortcuts
- Export/Import workflows as JSON
- Premium UI/UX inspired by Vercel and Linear

### Execution Engine
- Real-time workflow execution with node-by-node processing
- AI integration via Vercel AI SDK
- Live execution monitoring with logs and status tracking
- Comprehensive execution history

### MCP Integration
- Full support for Model Context Protocol (MCP) servers
- HTTP and STDIO transport protocols
- Automatic capability discovery
- Integration marketplace with pre-configured connectors

### Version Control
- Save, restore, and tag workflow versions
- Visual diff viewer for comparing workflow changes
- Complete version history tracking

## 🛠 Tech Stack

- **Frontend:** Next.js 16 (App Router), React 19, TailwindCSS 4
- **Backend:** Supabase (PostgreSQL, Auth, Realtime)
- **AI:** Vercel AI SDK
- **Integration:** Model Context Protocol (MCP)

## 📦 Getting Started

### Prerequisites

- Node.js 18+ and pnpm
- Supabase account and project

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/agentic-flow.git
cd agentic-flow
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your Supabase credentials and API keys.

4. Set up the database:

Follow the instructions in [`SUPABASE_SETUP.md`](./SUPABASE_SETUP.md) to create the necessary tables and configure Row Level Security.

5. Run the development server:
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 📚 Documentation

- [`SUPABASE_SETUP.md`](./SUPABASE_SETUP.md) - Database setup and configuration guide
- [`.cursor/context/CONTEXT.md`](./.cursor/context/CONTEXT.md) - Project context and completed features
- [`.cursor/context/TODO.md`](./.cursor/context/TODO.md) - Roadmap and planned improvements

## 🗺 Roadmap

See [`TODO.md`](.cursor/context/TODO.md) for the detailed roadmap, including:
- Pipefy integration (webhooks, cards, pipes)
- Advanced orchestration features
- Real MCP server implementation
- Enhanced guardrails and evaluations

## 📄 License

This is an exploratory "build in public" project primarily aimed at developer workflows.

## 🤝 Contributing

This is currently a personal project, but feedback and suggestions are welcome via issues.
