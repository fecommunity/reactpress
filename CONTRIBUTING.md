# Contributing to ReactPress

Thank you for your interest in contributing to ReactPress! We welcome contributions from the community to help improve the project.

## Code of Conduct

Please read and follow our [Code of Conduct](CODE_OF_CONDUCT.md) to ensure a welcoming and inclusive environment for all contributors.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/reactpress.git`
3. Create a new branch: `git checkout -b feature/your-feature-name`
4. Make your changes
5. Commit your changes: `git commit -m "Add your feature description"`
6. Push to your fork: `git push origin feature/your-feature-name`
7. Create a pull request

## Development Setup

### Prerequisites

- Node.js >= 18.0.0
- pnpm >= 7.0.0
- MySQL 5.7 or higher (or Docker via `reactpress-cli init`)

### Installation

```bash
# Clone the repository
git clone https://github.com/fecommunity/reactpress.git
cd reactpress

# Install dependencies
pnpm install

# First-time: generate .reactpress/config.json + .env
pnpm run init

# Start API + client
pnpm run dev
```

## Project Structure

ReactPress follows a monorepo structure. **API runtime lives in `@fecommunity/reactpress-cli`**, not in this repo.

```
reactpress/
├── client/          # Next.js frontend application
├── toolkit/         # OpenAPI-generated API client SDK
├── templates/       # Project templates
├── scripts/         # dev, publish, bundled API paths
├── docs/            # Documentation
└── .reactpress/     # CLI-written config (local)
```

## Development Workflow

### Running Services

```bash
# API + client (builds toolkit first, waits for API health)
pnpm run dev

# API only (reactpress-cli)
pnpm run dev:api

# Client only
pnpm run dev:client

# API lifecycle
pnpm exec reactpress-cli start
pnpm exec reactpress-cli stop
pnpm exec reactpress-cli status
```

### Building Packages

```bash
# Build toolkit + client
pnpm run build

# Build publishable workspace packages
pnpm run build:packages

# Build specific packages
pnpm run build:client
pnpm run build:toolkit
```

### Publishing

```bash
pnpm login
pnpm run release
```

Published packages: root meta, client, toolkit, templates. API is published as `@fecommunity/reactpress-cli`.

## Code Style

- Follow the existing code style in the project
- Use TypeScript for type safety
- Write clear, concise commit messages
- Update documentation as needed

## Pull Request Process

1. Ensure your code follows the project's style guidelines
2. Update documentation if you're changing functionality
3. Make sure all tests pass (if applicable)
4. Request review from maintainers

## Architecture

See [DESIGN.md](./DESIGN.md) for module boundaries and [TODO.md](./TODO.md) for the migration roadmap.
