export interface IndexedDBConfig {
  dbName: string;
  version: number;
  stores: StoreConfig[];
}

export interface StoreConfig {
  name: string;
  keyPath: string;
  indexes?: IndexConfig[];
}

export interface IndexConfig {
  name: string;
  keyPath: string;
  options?: IDBIndexParameters;
}

export interface IndexedDBError extends Error {
  code?: string;
  details?: unknown;
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export class IndexedDBManager {
  private config: IndexedDBConfig;
  private db: IDBDatabase | null = null;
  private connectionPromise: Promise<IDBDatabase> | null = null;
  private cache = new Map<string, CacheEntry<unknown>>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  private readonly MAX_CACHE_SIZE = 100;
  private isClosing = false;

  constructor(config: IndexedDBConfig) {
    this.config = config;
  }

  private getCacheKey(storeName: string, key: string | number): string {
    return `${storeName}:${String(key)}`;
  }

  private setCache<T>(key: string, data: T): void {
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      // Remove oldest entry
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: this.CACHE_TTL,
    });
  }

  private getCache<T>(key: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;
    if (!entry) return null;

    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  private clearCacheInternal(): void {
    this.cache.clear();
  }

  private isValidKey(key: unknown): key is string | number {
    return typeof key === "string" || typeof key === "number";
  }

  async openDB(): Promise<IDBDatabase> {
    if (this.isClosing) {
      throw new Error("Database is closing");
    }

    if (this.db) {
      return this.db;
    }

    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    this.connectionPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(this.config.dbName, this.config.version);

      request.onerror = () => {
        const error = new Error(`Failed to open IndexedDB: ${request.error?.message}`) as IndexedDBError;
        error.code = "DB_OPEN_ERROR";
        error.details = request.error;
        this.connectionPromise = null;
        reject(error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        this.connectionPromise = null;
        resolve(this.db);
      };

      request.onblocked = () => {
        const error = new Error("Database upgrade blocked by other connections") as IndexedDBError;
        error.code = "DB_BLOCKED";
        this.connectionPromise = null;
        reject(error);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object stores
        this.config.stores.forEach((storeConfig) => {
          if (!db.objectStoreNames.contains(storeConfig.name)) {
            const store = db.createObjectStore(storeConfig.name, { keyPath: storeConfig.keyPath });

            // Create indexes
            storeConfig.indexes?.forEach((indexConfig) => {
              store.createIndex(indexConfig.name, indexConfig.keyPath, indexConfig.options);
            });
          }
        });
      };
    });

    return this.connectionPromise;
  }

  async closeDB(): Promise<void> {
    this.isClosing = true;
    this.clearCacheInternal();

    if (this.db) {
      this.db.close();
      this.db = null;
    }

    this.connectionPromise = null;
    this.isClosing = false;
  }

  private async getDB(): Promise<IDBDatabase> {
    if (!this.db) {
      await this.openDB();
    }
    return this.db!;
  }

  async transaction<T>(
    storeNames: string[],
    mode: IDBTransactionMode,
    operation: (transaction: IDBTransaction) => Promise<T>
  ): Promise<T> {
    const db = await this.getDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeNames, mode);

      transaction.onerror = () => {
        const error = new Error(`Transaction failed: ${transaction.error?.message}`) as IndexedDBError;
        error.code = "TRANSACTION_ERROR";
        error.details = transaction.error;
        reject(error);
      };

      transaction.oncomplete = () => {
        // Transaction completed successfully
      };

      operation(transaction).then(resolve).catch(reject);
    });
  }

  async put<T>(storeName: string, data: T): Promise<void> {
    await this.transaction([storeName], "readwrite", async (transaction) => {
      const store = transaction.objectStore(storeName);

      return new Promise<void>((resolve, reject) => {
        const request = store.put(data);

        request.onsuccess = () => {
          // Invalidate cache for this key
          const key = (data as Record<string, unknown>)[this.getKeyPath(storeName)];
          if (this.isValidKey(key)) {
            this.cache.delete(this.getCacheKey(storeName, key));
          }
          resolve();
        };

        request.onerror = () => {
          const error = new Error(`Failed to put data: ${request.error?.message}`) as IndexedDBError;
          error.code = "PUT_ERROR";
          error.details = request.error;
          reject(error);
        };
      });
    });
  }

  async get<T>(storeName: string, key: string | number): Promise<T | null> {
    const cacheKey = this.getCacheKey(storeName, key);
    const cached = this.getCache<T>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    const result = await this.transaction([storeName], "readonly", async (transaction) => {
      const store = transaction.objectStore(storeName);

      return new Promise<T | null>((resolve, reject) => {
        const request = store.get(key);

        request.onsuccess = () => {
          const data = request.result || null;
          if (data) {
            this.setCache(cacheKey, data);
          }
          resolve(data);
        };

        request.onerror = () => {
          const error = new Error(`Failed to get data: ${request.error?.message}`) as IndexedDBError;
          error.code = "GET_ERROR";
          error.details = request.error;
          reject(error);
        };
      });
    });

    return result;
  }

  async getAll<T>(storeName: string): Promise<T[]> {
    return await this.transaction([storeName], "readonly", async (transaction) => {
      const store = transaction.objectStore(storeName);

      return new Promise<T[]>((resolve, reject) => {
        const request = store.getAll();

        request.onsuccess = () => {
          const data = request.result || [];
          // Cache individual items
          data.forEach((item: Record<string, unknown>) => {
            const key = item[this.getKeyPath(storeName)];
            if (this.isValidKey(key)) {
              this.setCache(this.getCacheKey(storeName, key), item);
            }
          });
          resolve(data);
        };

        request.onerror = () => {
          const error = new Error(`Failed to get all data: ${request.error?.message}`) as IndexedDBError;
          error.code = "GET_ALL_ERROR";
          error.details = request.error;
          reject(error);
        };
      });
    });
  }

  async delete(storeName: string, key: string | number): Promise<void> {
    await this.transaction([storeName], "readwrite", async (transaction) => {
      const store = transaction.objectStore(storeName);

      return new Promise<void>((resolve, reject) => {
        const request = store.delete(key);

        request.onsuccess = () => {
          // Remove from cache
          this.cache.delete(this.getCacheKey(storeName, key));
          resolve();
        };

        request.onerror = () => {
          const error = new Error(`Failed to delete data: ${request.error?.message}`) as IndexedDBError;
          error.code = "DELETE_ERROR";
          error.details = request.error;
          reject(error);
        };
      });
    });
  }

  async clear(storeName: string): Promise<void> {
    await this.transaction([storeName], "readwrite", async (transaction) => {
      const store = transaction.objectStore(storeName);

      return new Promise<void>((resolve, reject) => {
        const request = store.clear();

        request.onsuccess = () => {
          // Clear cache for this store
          for (const [key] of this.cache) {
            if (key.startsWith(`${storeName}:`)) {
              this.cache.delete(key);
            }
          }
          resolve();
        };

        request.onerror = () => {
          const error = new Error(`Failed to clear store: ${request.error?.message}`) as IndexedDBError;
          error.code = "CLEAR_ERROR";
          error.details = request.error;
          reject(error);
        };
      });
    });
  }

  async getByIndex<T>(storeName: string, indexName: string, key: string | number): Promise<T[]> {
    return await this.transaction([storeName], "readonly", async (transaction) => {
      const store = transaction.objectStore(storeName);
      const index = store.index(indexName);

      return new Promise<T[]>((resolve, reject) => {
        const request = index.getAll(key);

        request.onsuccess = () => {
          const data = request.result || [];
          // Cache individual items
          data.forEach((item: Record<string, unknown>) => {
            const key = item[this.getKeyPath(storeName)];
            if (this.isValidKey(key)) {
              this.setCache(this.getCacheKey(storeName, key), item);
            }
          });
          resolve(data);
        };

        request.onerror = () => {
          const error = new Error(`Failed to get by index: ${request.error?.message}`) as IndexedDBError;
          error.code = "GET_BY_INDEX_ERROR";
          error.details = request.error;
          reject(error);
        };
      });
    });
  }

  async count(storeName: string): Promise<number> {
    return await this.transaction([storeName], "readonly", async (transaction) => {
      const store = transaction.objectStore(storeName);

      return new Promise<number>((resolve, reject) => {
        const request = store.count();

        request.onsuccess = () => resolve(request.result);

        request.onerror = () => {
          const error = new Error(`Failed to count: ${request.error?.message}`) as IndexedDBError;
          error.code = "COUNT_ERROR";
          error.details = request.error;
          reject(error);
        };
      });
    });
  }

  private getKeyPath(storeName: string): string {
    const storeConfig = this.config.stores.find((store) => store.name === storeName);
    return storeConfig?.keyPath || "id";
  }

  // Batch operations for better performance
  async batchPut<T>(storeName: string, dataArray: T[]): Promise<void> {
    if (dataArray.length === 0) return;

    await this.transaction([storeName], "readwrite", async (transaction) => {
      const store = transaction.objectStore(storeName);

      const promises = dataArray.map((data) => {
        return new Promise<void>((resolve, reject) => {
          const request = store.put(data);

          request.onsuccess = () => {
            // Invalidate cache for this key
            const key = (data as Record<string, unknown>)[this.getKeyPath(storeName)];
            if (this.isValidKey(key)) {
              this.cache.delete(this.getCacheKey(storeName, key));
            }
            resolve();
          };

          request.onerror = () => {
            const error = new Error(`Failed to put data in batch: ${request.error?.message}`) as IndexedDBError;
            error.code = "BATCH_PUT_ERROR";
            error.details = request.error;
            reject(error);
          };
        });
      });

      await Promise.all(promises);
    });
  }

  async batchDelete(storeName: string, keys: (string | number)[]): Promise<void> {
    if (keys.length === 0) return;

    await this.transaction([storeName], "readwrite", async (transaction) => {
      const store = transaction.objectStore(storeName);

      const promises = keys.map((key) => {
        return new Promise<void>((resolve, reject) => {
          const request = store.delete(key);

          request.onsuccess = () => {
            // Remove from cache
            this.cache.delete(this.getCacheKey(storeName, key));
            resolve();
          };

          request.onerror = () => {
            const error = new Error(`Failed to delete data in batch: ${request.error?.message}`) as IndexedDBError;
            error.code = "BATCH_DELETE_ERROR";
            error.details = request.error;
            reject(error);
          };
        });
      });

      await Promise.all(promises);
    });
  }

  // Health check and maintenance
  async healthCheck(): Promise<boolean> {
    try {
      const db = await this.getDB();
      return true; // If we can get the DB, it's healthy
    } catch {
      return false;
    }
  }

  async clearCache(): Promise<void> {
    this.clearCacheInternal();
  }

  getCacheStats(): { size: number; maxSize: number } {
    return {
      size: this.cache.size,
      maxSize: this.MAX_CACHE_SIZE,
    };
  }
}
