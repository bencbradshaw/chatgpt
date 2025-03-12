export class IDB {
  private db: IDBDatabase;
  private version = 2;
  constructor(
    private dbName: string = 'chat-gpt',
    private stores: string[] = ['threads', 'indices', 'keys', 'system_messages']
  ) {}

  private promisify<T>(operation: () => IDBRequest): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const request = operation();
      request.onerror = () => {
        reject(request.error);
      };
      request.onsuccess = () => {
        resolve(request.result);
      };
    });
  }

  open(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      console.log('opening db');
      const openRequest = indexedDB.open(this.dbName, this.version);

      openRequest.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const storeNames = Array.from(db.objectStoreNames);
        for (const store of this.stores) {
          if (!storeNames.includes(store)) {
            if (store === 'indices' || store === 'keys') {
              db.createObjectStore(store);
            } else {
              db.createObjectStore(store, { keyPath: 'id', autoIncrement: true });
            }
          }
        }
      };

      openRequest.onerror = () => reject(openRequest.error);
      openRequest.onsuccess = () => {
        this.db = openRequest.result;
        resolve(this.db);
      };
    });
  }

  count(storeName: string): Promise<number> {
    return this.promisify<number>(() => {
      const transaction = this.db.transaction([storeName], 'readonly');
      const objectStore = transaction.objectStore(storeName);
      return objectStore.count();
    });
  }

  get<T>(storeName: string, key: IDBValidKey): Promise<T | undefined> {
    return this.promisify<T>(() => {
      const transaction = this.db.transaction([storeName], 'readonly');
      const objectStore = transaction.objectStore(storeName);
      return objectStore.get(key);
    });
  }

  put<T>(storeName: string, value: T, outlineKey?: IDBValidKey): Promise<IDBValidKey> {
    return this.promisify<IDBValidKey>(() => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const objectStore = transaction.objectStore(storeName);
      return outlineKey ? objectStore.put(value, outlineKey) : objectStore.put(value);
    });
  }

  add<T>(storeName: string, value: T): Promise<IDBValidKey> {
    return this.promisify<IDBValidKey>(() => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const objectStore = transaction.objectStore(storeName);
      return objectStore.add(value);
    });
  }

  getAll<T>(storeName: string): Promise<T[]> {
    return this.promisify<T[]>(() => {
      const transaction = this.db.transaction([storeName], 'readonly');
      const objectStore = transaction.objectStore(storeName);
      return objectStore.getAll();
    });
  }

  delete(storeName: string, key: IDBValidKey): Promise<void> {
    return this.promisify<void>(() => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const objectStore = transaction.objectStore(storeName);
      return objectStore.delete(key);
    });
  }
}
