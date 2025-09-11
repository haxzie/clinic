# Clinic CLI

A TypeScript CLI tool for running the clinic server locally.

## Features

- 🚀 Start the clinic server with hot reload
- 🌐 Built-in CORS support
- 📊 Request logging
- 🏥 Health check endpoint
- 🎨 Colored console output
- ⚡ Graceful shutdown handling

## Installation

From the project root:

```bash
# Install dependencies
pnpm install

# Build the CLI
pnpm build
```

## Usage

### Basic server start

```bash
# Start server on default port 3001
pnpm start start

# Or use the built binary directly
node dist/index.js start
```

### Custom configuration

```bash
# Custom port
pnpm start start --port 8080

# Custom environment file
pnpm start start --env .env.local

# Short options
pnpm start start -p 8080 -e .env.local
```

### Options

- `-p, --port <number>`: Port to run the server on (default: 3001)
- `-e, --env <path>`: Path to environment file (default: .env)

## Development

```bash
# Run in development mode with tsx
pnpm dev

# Watch mode for TypeScript compilation
pnpm watch

# Clean build artifacts
pnpm clean
```

## Examples

### Start server on default port

```bash
# Server runs on port 3001
pnpm start start
```

### Start server on custom port

```bash
# Server runs on port 8080
pnpm start start --port 8080
```

### Start with custom environment

```bash
# Use custom environment file
pnpm start start --env .env.development
```

## Health Check

The server provides a health check endpoint at `/health`:

```bash
curl http://localhost:3001/health
```

The server also includes relay and start endpoints as defined in the server routes.

## Stopping the Server

Press `Ctrl+C` to gracefully stop the server.
