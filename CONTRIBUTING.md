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

- Node.js >= 16.5.0
- pnpm >= 7.0.0
- MySQL 5.7 or higher

### Installation

```bash
# Clone the repository
git clone https://github.com/fecommunity/reactpress.git
cd reactpress

# Install dependencies
pnpm install

# Start development servers
pnpm run dev
```

## Project Structure

ReactPress follows a monorepo structure:

```
reactpress/
├── client/          # Next.js frontend application
├── server/          # NestJS backend API
├── toolkit/         # Auto-generated API client SDK
├── templates/       # Project templates
├── scripts/         # Build and deployment scripts
└── docs/            # Documentation
```

## Development Workflow

### Running Services

```bash
# Start both client and server in development mode
pnpm run dev

# Start only the server
pnpm run dev:server

# Start only the client
pnpm run dev:client
```

### Building Packages

```bash
# Build all packages
pnpm run build

# Build specific packages
pnpm run build:client
pnpm run build:server
pnpm run build:toolkit
```

### Testing

```bash
# Run all tests
pnpm test

# Run tests for specific package
pnpm test --dir client
pnpm test --dir server
```

## Code Style

- Follow the existing code style in the project
- Use TypeScript for type safety
- Write clear, concise commit messages
- Update documentation as needed

## Pull Request Process

1. Ensure your changes are well-tested
2. Update the README.md if you've changed functionality
3. Create a pull request with a clear title and description
4. Link any related issues in your pull request description
5. Be responsive to feedback during the review process

## Reporting Issues

If you find a bug or have a feature request, please [create an issue](https://github.com/fecommunity/reactpress/issues/new) on GitHub. Include as much detail as possible to help us understand and reproduce the problem.

## Publishing Packages

To publish packages to npm:

1. Ensure you're logged into npm: `pnpm login`
2. Run the publish script: `pnpm run publish`
3. Follow the interactive prompts to select packages and version increments

## License

By contributing to ReactPress, you agree that your contributions will be licensed under the MIT License.