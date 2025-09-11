# Storage System

This directory contains the storage implementation for the Clinic application using Dexie (IndexedDB) as the underlying storage engine.

## Overview

The storage system is built around an abstract `StorageDriver<T>` class that provides a consistent interface for CRUD operations. Two concrete implementations are provided:

- `APIStorageDriver` - Manages API entities
- `TabStorageDriver` - Manages tab entities

## Architecture

### StorageDriver Abstract Class

```typescript
export abstract class StorageDriver<T> {
  abstract list(): Promise<Array<T>>;
  abstract get(id: string): Promise<T>;
  abstract create(item: T): Promise<T>;
  abstract update(id: string, item: T): Promise<T>;
  abstract delete(id: string): Promise<void>;
}
```

### Database Schema

The Dexie database (`ClinicDatabase`) contains three tables:

- **apis**: Stores API entities with indexes on:

  - `id` (primary key)
  - `data.collectionId`
  - `data.createdAt`
  - `data.updatedAt`

- **tabs**: Stores tab entities with indexes on:

  - `id` (primary key)
  - `data.type`
  - `data.createdAt`

- **editorState**: Stores editor state with indexes on:
  - `id` (primary key, always 'main')

## Store Integration

The storage drivers are now fully integrated with the Zustand stores:

### API Store Integration

The `useApiStore` now includes database sync methods:

```typescript
// Load all APIs from database
await useApiStore.getState().loadFromDatabase();

// Create API (automatically saves to database)
const apiId = useApiStore.getState().createAPI(apiData);

// Update API (automatically syncs to database)
useApiStore.getState().updateAPI(apiId, { name: "Updated Name" });

// Delete API (automatically removes from database)
useApiStore.getState().deleteAPI(apiId);
```

### Editor Store Integration

The `useEditorStore` now includes comprehensive database sync methods:

```typescript
// Load all tabs and editor state from database
await useEditorStore.getState().loadFromDatabase();

// Create tab (automatically saves to database and updates editor state)
const tab = useEditorStore.getState().createTab(tabData);

// Update tab (automatically syncs to database)
useEditorStore.getState().updateTab(tabId, { metadata: { isActive: true } });

// Delete tab (automatically removes from database and updates editor state)
useEditorStore.getState().deleteTab(tabId);

// Set active tab (automatically persists to database)
useEditorStore.getState().setActiveTab(tabId);

// Manually save/load editor state
await useEditorStore.getState().saveEditorState();
await useEditorStore.getState().loadEditorState();
```

#### **Editor State Persistence** 🆕

The editor store now automatically persists:

- ✅ **Active tab selection** - Which tab is currently active
- ✅ **Tab order** - The exact order of tabs as arranged by the user
- ✅ **Last updated timestamp** - When the editor state was last modified

This means users will return to exactly the same tab layout and active tab they had when they last used the app.

## Usage

### Basic CRUD Operations

```typescript
import { apiStorage, tabStorage } from "@/lib/storage/db";

// Create
const api = await apiStorage.create({ id: "api-1", data: apiData });
const tab = await tabStorage.create({ id: "tab-1", data: tabData });

// Read
const api = await apiStorage.get("api-1");
const tab = await tabStorage.get("tab-1");

// Update
await apiStorage.update("api-1", updatedApi);
await tabStorage.update("tab-1", updatedTab);

// Delete
await apiStorage.delete("api-1");
await tabStorage.delete("tab-1");

// List all
const allApis = await apiStorage.list();
const allTabs = await tabStorage.list();
```

### Advanced Queries

#### API Storage

```typescript
// Find APIs by collection
const collectionApis = await apiStorage.findByCollection("collection-1");

// Find APIs by HTTP method
const getApis = await apiStorage.findByMethod("GET");
```

#### Tab Storage

```typescript
// Find tabs by type
const apiTabs = await tabStorage.findByType("api");

// Get tabs ordered by creation date (newest first)
const activeTabs = await tabStorage.getActiveTabs();
```

### App Integration

To use the storage system in your app, wrap your main component with the `StorageProvider`:

```typescript
// In your app layout or main component
import { StorageProvider } from '@/lib/storage/StorageProvider';

function App() {
  return (
    <StorageProvider
      fallback={<div>Loading app...</div>}
      errorFallback={<div>Failed to load app data</div>}
    >
      <YourAppContent />
    </StorageProvider>
  );
}
```

Or use the hook directly in components:

```typescript
import { useStoresReady } from '@/lib/storage/useStorageSync';

function MyComponent() {
  const storesReady = useStoresReady();

  if (!storesReady) {
    return <div>Loading...</div>;
  }

  return <div>Your component content</div>;
}
```

## Error Handling

All storage operations include proper error handling and logging:

```typescript
try {
  const api = await apiStorage.get("non-existent-id");
} catch (error) {
  console.error("API not found:", error);
  // Handle the error appropriately
}
```

## Data Models

### StoredAPI

```typescript
export interface StoredAPI {
  id: string;
  data: APISchema;
}
```

### StoredTabs

```typescript
export interface StoredTabs {
  id: string;
  data: TabSchema;
}
```

### EditorState 🆕

```typescript
export interface EditorState {
  activeTab: string | null;
  tabOrder: string[];
  lastUpdated: string;
}
```

## Performance Considerations

- **Indexed Queries**: Use the provided utility methods for common queries as they leverage database indexes
- **Batch Operations**: For multiple operations, consider using Dexie's transaction support
- **Memory Management**: Large datasets should be paginated using Dexie's `offset()` and `limit()` methods
- **Automatic Sync**: The stores now automatically sync to the database, so manual sync calls are not needed
- **State Persistence**: Editor state (active tab, tab order) is automatically persisted for seamless user experience

## Migration

When adding new fields or changing the schema:

1. Increment the database version in `ClinicDatabase`
2. Add new indexes if needed
3. Handle data migration in the version upgrade function

Example:

```typescript
this.version(3).stores({
  apis: "id, data.collectionId, data.createdAt, data.updatedAt, data.status",
  tabs: "id, data.type, data.createdAt, data.priority",
  editorState: "id, lastUpdated",
});
```

## Testing

The storage system can be tested using the integrated stores. The database operations are automatically logged to the console for debugging purposes.

## Dependencies

- `dexie`: IndexedDB wrapper for modern browsers
- `@/types/API.types`: API schema definitions
- `@/store/editor-store/editor.types`: Tab schema definitions
- `zustand`: State management library
