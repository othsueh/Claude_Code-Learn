# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Quick Commands

### Setup & Installation
```bash
npm run setup          # Install dependencies, generate Prisma client, run migrations
```

### Development
```bash
npm run dev            # Start Next.js dev server on http://localhost:3000
npm run dev:daemon     # Start dev server in background, logs to logs.txt
```

### Building & Deployment
```bash
npm run build          # Build for production
npm run start          # Start production server
```

### Testing & Quality
```bash
npm test              # Run Vitest test suite (watch mode by default)
npm run lint          # Run ESLint
```

### Database
```bash
npm run db:reset      # Reset database (drops and recreates migrations)
```

## Architecture Overview

### Virtual File System
UIGen uses an in-memory virtual file system (`VirtualFileSystem` class) rather than writing files to disk. This allows users to create, edit, preview, and export React components without persisting to the filesystem.

- **Location**: `src/lib/file-system.ts`
- **Key methods**: `createFile()`, `updateFile()`, `deleteFile()`, `rename()`, `serialize()`, `deserializeFromNodes()`
- **State management**: Files stored in a `Map<string, FileNode>` with hierarchical directory support

### Chat-Driven Component Generation
The application uses Vercel AI SDK to stream responses from Claude. Users describe components in a chat interface, and Claude uses tool calls to manipulate the virtual file system.

- **Chat endpoint**: `src/app/api/chat/route.ts`
- **Chat context**: `src/lib/contexts/chat-context.tsx` (wraps `useAIChat` from `@ai-sdk/react`)
- **System prompt**: `src/lib/prompts/generation.tsx` (guides Claude to generate React components)

### Tool Integration
Claude can execute two tool types:
1. **str_replace_editor** (`src/lib/tools/str-replace.ts`) - Edit file contents using string replacement
2. **file_manager** (`src/lib/tools/file-manager.ts`) - Create, delete, rename files and directories

### File System Context & UI State
- **FileSystemContext** (`src/lib/contexts/file-system-context.tsx`) - Manages virtual file system state and selected file
- **FileSystemProvider** - Wraps the app, provides file system operations to all components
- **handleToolCall()** - Bridges AI tool calls to file system updates

### Project Persistence
- **Database**: SQLite via Prisma (`prisma/schema.prisma`)
- **Models**: `User` (registered users) and `Project` (stores messages and serialized file system state)
- **For registered users**: Projects save chat history and generated code automatically
- **For anonymous users**: Data is temporarily stored in browser using `anon-work-tracker.ts`

### Authentication
- **Location**: `src/lib/auth.ts`
- **Session management**: JWT-based authentication via middleware (`src/middleware.ts`)
- **Protected routes**: Only authenticated users can save projects persistently

### Component Preview
- **PreviewFrame** (`src/components/preview/PreviewFrame.tsx`) - Renders generated React components in an iframe
- **JSX Transformer** (`src/lib/transform/jsx-transformer.ts`) - Transforms JSX to executable code using Babel standalone
- **Hot reload** - Preview updates when file system changes

### Key Constraints
- **API Key Optional**: The app works without an Anthropic API key, falling back to static code generation
- **Mock Provider**: If no API key, uses a mock provider with limited capabilities (max 4 steps vs 40)
- **Token Caching**: Uses Anthropic's ephemeral cache control for the generation prompt to reduce costs
- **Response Streaming**: Chat responses stream via `streamText()` with tool execution
- **Database Migrations**: Uses Prisma for schema management. Run `npm run setup` on first install

## Code Locations by Feature

| Feature | Location |
|---------|----------|
| Main app layout & routing | `src/app/page.tsx`, `src/app/[projectId]/page.tsx` |
| Chat interface | `src/components/chat/` |
| Code editor & file tree | `src/components/editor/` |
| UI components (Radix) | `src/components/ui/` |
| Authentication | `src/lib/auth.ts`, `src/components/auth/` |
| Actions (server) | `src/actions/` |
| Hooks | `src/hooks/use-auth.ts` |
| Tests | `**/__tests__/*.test.tsx` or `*.test.ts` |

## Testing
Tests use Vitest with React Testing Library. Run individual tests with:
```bash
npm test -- FileTree.test.tsx
```

## Environment Variables
- **ANTHROPIC_API_KEY** (optional) - Claude API key for component generation. Without it, the app uses static fallback code.

## Important Notes
- **No persisted files**: The virtual file system is in-memory only
- **User isolation**: Projects are isolated per user via Prisma relationship checks in `src/app/api/chat/route.ts`
- **Babel transformation**: Generated JSX is transformed client-side using Babel standalone to support dynamic code execution
