# Studio Development Setup

This directory contains the development setup for the API Clinic Studio package. It allows you to run the studio in isolation for quick development and testing.

## Getting Started

1. **Install dependencies** (from the root of the monorepo):

   ```bash
   pnpm install
   ```

2. **Set up environment variables** (optional):

   Create a `.env.local` file in the `packages/studio` directory:

   ```bash
   # Relay API URL - defaults to http://localhost:8787
   VITE_RELAY_API_URL=http://localhost:8787
   ```

3. **Run the development server**:

   ```bash
   cd packages/studio
   pnpm dev
   ```

   The development server will start on `http://localhost:3001` and automatically open in your browser.

## What's Included

- **`dev/main.tsx`**: Entry point that sets up the Studio component with StudioProvider
- **`dev/relay.ts`**: Mock relay client for development (connects to local relay server)
- **`dev/styles.scss`**: Development-specific styles
- **`index.html`**: HTML template for the dev server

## Development vs Build

- **Development mode** (`pnpm dev`): Runs a standard Vite dev server with HMR for quick iteration
- **Build mode** (`pnpm build`): Builds the library as UMD/ES modules for consumption by other apps

The Vite configuration automatically switches between these modes based on the command being run.

## Notes

- Analytics events are logged to the console in dev mode
- The relay client connects to `http://localhost:8787` by default (configurable via `VITE_RELAY_API_URL`)
- Changes to the source code will hot-reload automatically
- This dev setup does not affect the library build output
