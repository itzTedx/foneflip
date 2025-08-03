import { IndexedDBConfig, IndexedDBManager } from "./core";

export interface StorageConfig<T> {
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

export class StorageFactory<T> {
  private dbManager: IndexedDBManager;
  private storeName: string;
  private keyPath: keyof T;

  constructor(config: StorageConfig<T>) {
    const dbConfig: IndexedDBConfig = {
      dbName: config.dbName,
      version: config.version,
      stores: [
        {
          name: config.storeName,
          keyPath: config.keyPath as string,
          indexes: config.indexes?.map((index) => ({
            name: index.name,
            keyPath: index.keyPath as string,
            options: index.options,
          })),
        },
      ],
    };

    this.dbManager = new IndexedDBManager(dbConfig);
    this.storeName = config.storeName;
    this.keyPath = config.keyPath;
  }

  async save(data: T): Promise<void> {
    await this.dbManager.put(this.storeName, data);
  }

  async get(key: string | number): Promise<T | null> {
    return await this.dbManager.get<T>(this.storeName, key);
  }

  async getAll(): Promise<T[]> {
    return await this.dbManager.getAll<T>(this.storeName);
  }

  async update(key: string | number, updates: Partial<T>): Promise<void> {
    const existingData = await this.get(key);
    if (!existingData) {
      throw new Error("Data not found");
    }

    const updatedData = {
      ...existingData,
      ...updates,
    };

    await this.dbManager.put(this.storeName, updatedData);
  }

  async delete(key: string | number): Promise<void> {
    await this.dbManager.delete(this.storeName, key);
  }

  async clear(): Promise<void> {
    await this.dbManager.clear(this.storeName);
  }

  async getByIndex(indexName: string, key: string | number): Promise<T[]> {
    return await this.dbManager.getByIndex<T>(this.storeName, indexName, key);
  }

  async count(): Promise<number> {
    return await this.dbManager.count(this.storeName);
  }

  // Batch operations for better performance
  async batchSave(dataArray: T[]): Promise<void> {
    await this.dbManager.batchPut(this.storeName, dataArray);
  }

  async batchDelete(keys: (string | number)[]): Promise<void> {
    await this.dbManager.batchDelete(this.storeName, keys);
  }

  // Health check and maintenance
  async healthCheck(): Promise<boolean> {
    return await this.dbManager.healthCheck();
  }

  async clearCache(): Promise<void> {
    await this.dbManager.clearCache();
  }

  getCacheStats(): { size: number; maxSize: number } {
    return this.dbManager.getCacheStats();
  }

  // Close the database connection
  async close(): Promise<void> {
    await this.dbManager.closeDB();
  }
}

// Helper function to create storage instances
export function createStorage<T>(config: StorageConfig<T>): StorageFactory<T> {
  return new StorageFactory<T>(config);
}
