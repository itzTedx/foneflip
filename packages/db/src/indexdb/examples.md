# IndexedDB Usage Examples

This document shows how different apps can use the core IndexedDB infrastructure from `@ziron/db`.

## Example 1: User Settings Storage

```typescript
// apps/admin/src/lib/storage/user-settings.ts
import { createStorage } from "@ziron/db";

interface UserSettings {
  userId: string;
  theme: "light" | "dark" | "system";
  language: string;
  notifications: boolean;
  sidebarCollapsed: boolean;
  createdAt: string;
  updatedAt: string;
}

export const userSettingsStorage = createStorage<UserSettings>({
  dbName: "admin-user-settings-db",
  version: 1,
  storeName: "settings",
  keyPath: "userId",
  indexes: [
    { name: "theme", keyPath: "theme" },
    { name: "language", keyPath: "language" },
  ],
});

export async function saveUserSettings(data: Omit<UserSettings, "createdAt" | "updatedAt">): Promise<void> {
  const now = new Date().toISOString();
  const settings: UserSettings = {
    ...data,
    createdAt: now,
    updatedAt: now,
  };

  await userSettingsStorage.save(settings);
}

export async function getUserSettings(userId: string): Promise<UserSettings | null> {
  return await userSettingsStorage.get(userId);
}
```

## Example 2: Cache Storage

```typescript
// apps/mobile/src/lib/storage/cache.ts
import { createStorage } from "@ziron/db";

interface CacheEntry {
  key: string;
  value: string;
  expiresAt: string;
  createdAt: string;
}

export const cacheStorage = createStorage<CacheEntry>({
  dbName: "mobile-cache-db",
  version: 1,
  storeName: "cache",
  keyPath: "key",
  indexes: [
    { name: "expiresAt", keyPath: "expiresAt" },
  ],
});

export async function setCache(key: string, value: string, ttlSeconds: number = 3600): Promise<void> {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + ttlSeconds * 1000).toISOString();
  
  await cacheStorage.save({
    key,
    value,
    expiresAt,
    createdAt: now.toISOString(),
  });
}

export async function getCache(key: string): Promise<string | null> {
  const entry = await cacheStorage.get(key);
  if (!entry) return null;
  
  if (new Date(entry.expiresAt) < new Date()) {
    await cacheStorage.delete(key);
    return null;
  }
  
  return entry.value;
}
```

## Example 3: Form Data Storage

```typescript
// apps/portal/src/lib/storage/form-data.ts
import { createStorage } from "@ziron/db";

interface FormData {
  formId: string;
  userId: string;
  data: Record<string, unknown>;
  step: number;
  createdAt: string;
  updatedAt: string;
}

export const formDataStorage = createStorage<FormData>({
  dbName: "portal-form-data-db",
  version: 1,
  storeName: "forms",
  keyPath: "formId",
  indexes: [
    { name: "userId", keyPath: "userId" },
    { name: "step", keyPath: "step" },
  ],
});

export async function saveFormData(data: Omit<FormData, "createdAt" | "updatedAt">): Promise<void> {
  const now = new Date().toISOString();
  const formData: FormData = {
    ...data,
    createdAt: now,
    updatedAt: now,
  };

  await formDataStorage.save(formData);
}

export async function getFormData(formId: string): Promise<FormData | null> {
  return await formDataStorage.get(formId);
}

export async function getUserForms(userId: string): Promise<FormData[]> {
  return await formDataStorage.getByIndex("userId", userId);
}
```

## Example 4: Analytics Events Storage

```typescript
// apps/analytics/src/lib/storage/events.ts
import { createStorage } from "@ziron/db";

interface AnalyticsEvent {
  eventId: string;
  userId?: string;
  eventType: string;
  eventData: Record<string, unknown>;
  timestamp: string;
  createdAt: string;
}

export const analyticsStorage = createStorage<AnalyticsEvent>({
  dbName: "analytics-events-db",
  version: 1,
  storeName: "events",
  keyPath: "eventId",
  indexes: [
    { name: "userId", keyPath: "userId" },
    { name: "eventType", keyPath: "eventType" },
    { name: "timestamp", keyPath: "timestamp" },
  ],
});

export async function trackEvent(event: Omit<AnalyticsEvent, "eventId" | "createdAt">): Promise<void> {
  const eventId = crypto.randomUUID();
  const now = new Date().toISOString();
  
  await analyticsStorage.save({
    ...event,
    eventId,
    createdAt: now,
  });
}

export async function getEventsByUser(userId: string): Promise<AnalyticsEvent[]> {
  return await analyticsStorage.getByIndex("userId", userId);
}

export async function getEventsByType(eventType: string): Promise<AnalyticsEvent[]> {
  return await analyticsStorage.getByIndex("eventType", eventType);
}
```

## Example 5: Offline Queue Storage

```typescript
// apps/shared/src/lib/storage/offline-queue.ts
import { createStorage } from "@ziron/db";

interface OfflineQueueItem {
  queueId: string;
  action: string;
  payload: Record<string, unknown>;
  retryCount: number;
  createdAt: string;
  updatedAt: string;
}

export const offlineQueueStorage = createStorage<OfflineQueueItem>({
  dbName: "offline-queue-db",
  version: 1,
  storeName: "queue",
  keyPath: "queueId",
  indexes: [
    { name: "action", keyPath: "action" },
    { name: "retryCount", keyPath: "retryCount" },
  ],
});

export async function addToQueue(action: string, payload: Record<string, unknown>): Promise<void> {
  const queueId = crypto.randomUUID();
  const now = new Date().toISOString();
  
  await offlineQueueStorage.save({
    queueId,
    action,
    payload,
    retryCount: 0,
    createdAt: now,
    updatedAt: now,
  });
}

export async function getQueueItems(): Promise<OfflineQueueItem[]> {
  return await offlineQueueStorage.getAll();
}

export async function incrementRetryCount(queueId: string): Promise<void> {
  const item = await offlineQueueStorage.get(queueId);
  if (!item) return;
  
  await offlineQueueStorage.update(queueId, {
    retryCount: item.retryCount + 1,
    updatedAt: new Date().toISOString(),
  });
}
```

## Example 6: Media Cache Storage

```typescript
// apps/media/src/lib/storage/media-cache.ts
import { createStorage } from "@ziron/db";

interface MediaCache {
  mediaId: string;
  url: string;
  blob: Blob;
  size: number;
  type: string;
  createdAt: string;
}

export const mediaCacheStorage = createStorage<MediaCache>({
  dbName: "media-cache-db",
  version: 1,
  storeName: "media",
  keyPath: "mediaId",
  indexes: [
    { name: "url", keyPath: "url" },
    { name: "type", keyPath: "type" },
    { name: "size", keyPath: "size" },
  ],
});

export async function cacheMedia(url: string, blob: Blob, type: string): Promise<void> {
  const mediaId = crypto.randomUUID();
  
  await mediaCacheStorage.save({
    mediaId,
    url,
    blob,
    size: blob.size,
    type,
    createdAt: new Date().toISOString(),
  });
}

export async function getCachedMedia(url: string): Promise<MediaCache | null> {
  const results = await mediaCacheStorage.getByIndex("url", url);
  return results[0] || null;
}
```

## Best Practices

1. **App-Specific Database Names**: Use unique database names for each app
2. **Version Management**: Increment versions when schema changes
3. **Error Handling**: Always wrap operations in try-catch blocks
4. **Type Safety**: Use TypeScript interfaces for all data structures
5. **Indexing**: Create indexes for frequently queried fields
6. **Cleanup**: Implement data expiration and cleanup strategies
7. **Testing**: Test IndexedDB operations in different browsers 