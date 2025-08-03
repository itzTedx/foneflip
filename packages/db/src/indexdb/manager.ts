import { IndexedDBConfig, IndexedDBManager } from "./core";
import { StorageConfig, StorageFactory } from "./factory";

export interface DatabaseManagerConfig {
  maxConnections?: number;
  connectionTimeout?: number;
  enableCaching?: boolean;
  cacheSize?: number;
  cacheTTL?: number;
}

export class DatabaseManager {
  private static instance: DatabaseManager;
  private managers = new Map<string, IndexedDBManager>();
  private storages = new Map<string, StorageFactory<unknown>>();
  private config: DatabaseManagerConfig;
  private isInitialized = false;

  private constructor(config: DatabaseManagerConfig = {}) {
    this.config = {
      maxConnections: 10,
      connectionTimeout: 30000, // 30 seconds
      enableCaching: true,
      cacheSize: 100,
      cacheTTL: 5 * 60 * 1000, // 5 minutes
      ...config,
    };
  }

  static getInstance(config?: DatabaseManagerConfig): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager(config);
    }
    return DatabaseManager.instance;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    // Initialize any global database connections here
    this.isInitialized = true;
  }

  async getManager(config: IndexedDBConfig): Promise<IndexedDBManager> {
    const key = `${config.dbName}-${config.version}`;

    if (!this.managers.has(key)) {
      const manager = new IndexedDBManager(config);
      this.managers.set(key, manager);
    }

    return this.managers.get(key)!;
  }

  async createStorage<T>(config: StorageConfig<T>): Promise<StorageFactory<T>> {
    const key = `${config.dbName}-${config.storeName}`;

    if (!this.storages.has(key)) {
      const storage = new StorageFactory<T>(config);
      this.storages.set(key, storage as StorageFactory<unknown>);
    }

    return this.storages.get(key)! as StorageFactory<T>;
  }

  async getStorage<T>(dbName: string, storeName: string): Promise<StorageFactory<T> | null> {
    const key = `${dbName}-${storeName}`;
    return (this.storages.get(key) as StorageFactory<T>) || null;
  }

  async closeAll(): Promise<void> {
    const closePromises = Array.from(this.managers.values()).map((manager) => manager.closeDB());
    await Promise.all(closePromises);

    this.managers.clear();
    this.storages.clear();
    this.isInitialized = false;
  }

  async healthCheck(): Promise<{ healthy: boolean; connections: number; storages: number }> {
    const healthChecks = Array.from(this.managers.values()).map((manager) => manager.healthCheck());
    const results = await Promise.all(healthChecks);

    return {
      healthy: results.every((result) => result),
      connections: this.managers.size,
      storages: this.storages.size,
    };
  }

  getStats(): {
    managers: number;
    storages: number;
    isInitialized: boolean;
  } {
    return {
      managers: this.managers.size,
      storages: this.storages.size,
      isInitialized: this.isInitialized,
    };
  }

  // Predefined storage configurations for common use cases
  static readonly STORAGE_CONFIGS = {
    onboarding: {
      steps: {
        dbName: "onboarding-steps-db",
        version: 1,
        storeName: "steps",
        keyPath: "stepId",
        indexes: [
          { name: "userId", keyPath: "userId" },
          { name: "stepName", keyPath: "stepName" },
          { name: "status", keyPath: "status" },
        ],
      },
      progress: {
        dbName: "onboarding-progress-db",
        version: 1,
        storeName: "progress",
        keyPath: "userId",
        indexes: [
          { name: "currentStep", keyPath: "currentStep" },
          { name: "progress", keyPath: "progress" },
        ],
      },
      data: {
        dbName: "onboarding-data-db",
        version: 1,
        storeName: "data",
        keyPath: "userId",
        indexes: [
          { name: "createdAt", keyPath: "createdAt" },
          { name: "updatedAt", keyPath: "updatedAt" },
        ],
      },
    },
    userSettings: {
      dbName: "user-settings-db",
      version: 1,
      storeName: "settings",
      keyPath: "userId",
      indexes: [
        { name: "theme", keyPath: "theme" },
        { name: "language", keyPath: "language" },
      ],
    },
    cache: {
      dbName: "cache-db",
      version: 1,
      storeName: "cache",
      keyPath: "key",
      indexes: [
        { name: "type", keyPath: "type" },
        { name: "expiresAt", keyPath: "expiresAt" },
      ],
    },
  } as const;
}

// Convenience functions for common operations
export async function getOnboardingStorage<T>(): Promise<StorageFactory<T>> {
  const manager = DatabaseManager.getInstance();
  await manager.initialize();

  const config = DatabaseManager.STORAGE_CONFIGS.onboarding.steps as unknown as StorageConfig<T>;
  return await manager.createStorage<T>(config);
}

export async function getUserSettingsStorage<T>(): Promise<StorageFactory<T>> {
  const manager = DatabaseManager.getInstance();
  await manager.initialize();

  const config = DatabaseManager.STORAGE_CONFIGS.userSettings as unknown as StorageConfig<T>;
  return await manager.createStorage<T>(config);
}

export async function getCacheStorage<T>(): Promise<StorageFactory<T>> {
  const manager = DatabaseManager.getInstance();
  await manager.initialize();

  const config = DatabaseManager.STORAGE_CONFIGS.cache as unknown as StorageConfig<T>;
  return await manager.createStorage<T>(config);
}
