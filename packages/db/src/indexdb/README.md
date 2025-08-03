# IndexedDB Core Module for @ziron/db

This module provides the core IndexedDB infrastructure for the entire application. It includes a low-level manager and factory pattern for creating storage instances for any data type.

## Features

- **Core Infrastructure**: Low-level IndexedDB operations
- **Type Safety**: Full TypeScript support with generic types
- **Factory Pattern**: Easy creation of storage instances for any data type
- **Error Handling**: Comprehensive error handling with detailed error codes
- **Indexing**: Automatic index creation and management
- **Transaction Management**: Automatic transaction handling and cleanup
- **Multiple Databases**: Support for multiple databases with different schemas

## Architecture

### Core Components

1. **IndexedDBManager** (`core.ts`): Low-level IndexedDB operations
2. **StorageFactory** (`factory.ts`): Generic storage instance creator

### Database Structure

```
@ziron/db/
├── indexdb/
│   ├── core.ts          # Core IndexedDB manager
│   ├── factory.ts       # Storage factory pattern
│   ├── index.ts         # Main exports
│   └── README.md        # This documentation
```

## Usage

### Creating Custom Storage

```typescript
import { createStorage } from "@ziron/db";

interface UserSettings {
  userId: string;
  theme: "light" | "dark";
  language: string;
  notifications: boolean;
}

const userSettingsStorage = createStorage<UserSettings>({
  dbName: "user-settings-db",
  version: 1,
  storeName: "settings",
  keyPath: "userId",
  indexes: [
    { name: "theme", keyPath: "theme" },
    { name: "language", keyPath: "language" },
  ],
});

// Use the storage
await userSettingsStorage.save({
  userId: "user123",
  theme: "dark",
  language: "en",
  notifications: true,
});

const settings = await userSettingsStorage.get("user123");
```

### Direct Manager Usage

```typescript
import { IndexedDBManager } from "@ziron/db";

const manager = new IndexedDBManager({
  dbName: "my-db",
  version: 1,
  stores: [
    {
      name: "my-store",
      keyPath: "id",
      indexes: [
        { name: "category", keyPath: "category" },
      ],
    },
  ],
});

await manager.put("my-store", { id: "1", name: "Item", category: "test" });
const item = await manager.get("my-store", "1");
```

## API Reference

### Core Functions

#### IndexedDBManager

- `openDB()`: Opens database connection
- `closeDB(db)`: Closes database connection
- `transaction(storeNames, mode, operation)`: Executes transaction
- `put(storeName, data)`: Saves data
- `get(storeName, key)`: Retrieves data by key
- `getAll(storeName)`: Retrieves all data
- `delete(storeName, key)`: Deletes data by key
- `clear(storeName)`: Clears all data
- `getByIndex(storeName, indexName, key)`: Retrieves by index
- `count(storeName)`: Counts records

#### StorageFactory

- `save(data)`: Saves data
- `get(key)`: Retrieves data by key
- `getAll()`: Retrieves all data
- `update(key, updates)`: Updates existing data
- `delete(key)`: Deletes data by key
- `clear()`: Clears all data
- `getByIndex(indexName, key)`: Retrieves by index
- `count()`: Counts records

## Data Types

### StorageConfig

```typescript
interface StorageConfig<T> {
  dbName: string;
  version: number;
  storeName: string;
  keyPath: keyof T;
  indexes?: Array<{
    name: string;
    keyPath: keyof T;
    options?: IDBIndexParameters;
  }>;
}
```

## Error Handling

All functions include comprehensive error handling:

```typescript
try {
  await storage.save(data);
} catch (error) {
  if (error.code === "DB_OPEN_ERROR") {
    console.error("Failed to open database:", error.message);
  } else if (error.code === "PUT_ERROR") {
    console.error("Failed to save data:", error.message);
  }
}
```

## Browser Support

- Chrome 23+
- Firefox 16+
- Safari 10+
- Edge 12+

## Performance Considerations

- **Connection Management**: Automatic connection opening/closing
- **Transaction Optimization**: Efficient transaction handling
- **Memory Management**: Proper cleanup of database connections
- **Index Usage**: Optimized queries using indexes
- **Error Recovery**: Graceful error handling and recovery

## Security

- **Local Storage**: Data stored locally in browser
- **No Network**: No data transmitted over network
- **User Control**: Users can clear data through browser settings
- **Privacy**: Data remains on user's device

## Migration

When updating database schemas:

1. Increment the `version` number
2. Add new stores or indexes in `onupgradeneeded`
3. Handle data migration if needed
4. Test thoroughly before deployment

## Integration

This core module is designed to be used by application-specific modules:

- **Portal Apps**: Create vendor-specific storage using the factory
- **Other Apps**: Create app-specific storage instances
- **Shared Logic**: Common database operations across the monorepo 