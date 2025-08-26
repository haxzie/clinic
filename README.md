# Clinic

[![Homepage](https://clinic.sh)](https://clinic.sh)

**Clinic** is a minimal, open-source API client designed to run directly in your browser. Easily explore, send, and organize HTTP requests, all with a snappy interface and seamless local persistence—no external servers required.

---

## Features

- **Minimal, Fast, and Modern:** Lightweight, responsive UI built for productivity.
- **API Request Builder:** Compose and send HTTP requests with support for custom headers, body, and methods.
- **Tabbed Interface:** Organize multiple API requests with tabs. Your tab order and active tab are auto-saved.
- **Local-First Storage:** All data is securely stored in your browser using IndexedDB (via Dexie). No data ever leaves your device.
- **Collection Management:** Group APIs by collections for better organization.
- **Automatic State Persistence:** Your layout, open tabs, and active API are restored on every visit.
- **Built with TypeScript, Next.js, Zustand, and Dexie.**

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) or [Bun](https://bun.sh) (for dev)
- [pnpm](https://pnpm.io/), [yarn](https://yarnpkg.com/), or [npm](https://www.npmjs.com/)

### Monorepo Structure

- `apps/web-app`: The Next.js web frontend
- `apps/server`: (optional) Backend server for advanced features

### Quick Start (Web App)

```bash
# From the root of the repo
cd apps/web-app

# Install dependencies
pnpm install # or yarn install / npm install / bun install

# Start development server
pnpm dev # or yarn dev / npm run dev / bun dev

# Open http://localhost:3000 in your browser
```

### Quick Start (Server - Optional)

```bash
cd apps/server
bun install
bun run dev
# Open http://localhost:3000
```

---

## Storage System

Clinic uses a robust local storage engine built on [Dexie](https://dexie.org/) for IndexedDB. All your data (APIs, tabs, editor state) is stored and synced automatically.

### Storage Drivers

- **APIStorageDriver:** Manages API entities
- **TabStorageDriver:** Manages tab entities

### Example Usage

```typescript
import { apiStorage, tabStorage } from "@/lib/storage/db";

// Create
const api = await apiStorage.create({ id: "api-1", data: apiData });

// Read
const api = await apiStorage.get("api-1");

// Update
await apiStorage.update("api-1", updatedApi);

// Delete
await apiStorage.delete("api-1");

// List all
const allApis = await apiStorage.list();
```

### Editor State Persistence

- Active tab selection
- Tab order
- Last updated timestamp

Users will return to the exact tab layout they had previously.

---

## Architecture

- **Frontend:** Next.js, TypeScript, Zustand, Geist font, Vercel-ready
- **State Management:** Zustand
- **Storage:** Dexie (IndexedDB)
- **Backend (optional):** Bun

---

## Development

- Code is organized as a monorepo.
- Use `pnpm`, `yarn`, `npm`, or `bun` in each app directory as needed.
- Editor and API state are persisted locally for seamless experience.

---

## Contributing

Contributions are welcome! Please open issues or pull requests.

---

## License

This project is open-source, see [LICENSE](LICENSE) for details.

---

## Acknowledgements

- [Next.js](https://nextjs.org/)
- [Dexie](https://dexie.org/)
- [Zustand](https://zustand-demo.pmnd.rs/)
- [Bun](https://bun.sh/)

---

## Links

- Homepage: [https://clinic.sh](https://clinic.sh)
- GitHub: [haxzie/clinic](https://github.com/haxzie/clinic)

---