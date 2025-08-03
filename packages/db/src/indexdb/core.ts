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

export class IndexedDBManager {
  private config: IndexedDBConfig;

  constructor(config: IndexedDBConfig) {
    this.config = config;
  }

  async openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.config.dbName, this.config.version);

      request.onerror = () => {
        const error = new Error(`Failed to open IndexedDB: ${request.error?.message}`) as IndexedDBError;
        error.code = "DB_OPEN_ERROR";
        error.details = request.error;
        reject(error);
      };

      request.onsuccess = () => resolve(request.result);

      request.onblocked = () => {
        const error = new Error("Database upgrade blocked by other connections") as IndexedDBError;
        error.code = "DB_BLOCKED";
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
  }
  async closeDB(db: IDBDatabase): Promise<void> {
    db.close();
  }

  async transaction<T>(
    storeNames: string[],
    mode: IDBTransactionMode,
    operation: (transaction: IDBTransaction) => Promise<T>
  ): Promise<T> {
    const db = await this.openDB();

    try {
      const transaction = db.transaction(storeNames, mode);

      return await operation(transaction);
    } finally {
      this.closeDB(db);
    }
  }

  async put<T>(storeName: string, data: T): Promise<void> {
    await this.transaction([storeName], "readwrite", async (transaction) => {
      const store = transaction.objectStore(storeName);

      return new Promise<void>((resolve, reject) => {
        const request = store.put(data);
        request.onsuccess = () => resolve();
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
    return await this.transaction([storeName], "readonly", async (transaction) => {
      const store = transaction.objectStore(storeName);

      return new Promise<T | null>((resolve, reject) => {
        const request = store.get(key);
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => {
          const error = new Error(`Failed to get data: ${request.error?.message}`) as IndexedDBError;
          error.code = "GET_ERROR";
          error.details = request.error;
          reject(error);
        };
      });
    });
  }

  async getAll<T>(storeName: string): Promise<T[]> {
    return await this.transaction([storeName], "readonly", async (transaction) => {
      const store = transaction.objectStore(storeName);

      return new Promise<T[]>((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result || []);
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
        request.onsuccess = () => resolve();
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
        request.onsuccess = () => resolve();
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
        request.onsuccess = () => resolve(request.result || []);
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
}
