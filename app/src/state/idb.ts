export class IDB {
  private db: IDBDatabase;
  private version = 1;
  constructor(private dbName: string = 'chat-gpt', private stores: string[] = ['threads', 'indices', 'keys']) {}

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
      if (this.db) {
        resolve(this.db);
        return;
      }
      console.log('opening db');
      const request = indexedDB.open(this.dbName, this.version);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const storeNames = Array.from(db.objectStoreNames);
        console.log('storeNames', storeNames);
        for (const store of this.stores) {
          if (!storeNames.includes(store)) {
            console.log('creating store', store);
            if (store === 'indices' || store === 'keys') {
              db.createObjectStore(store);
            } else {
              db.createObjectStore(store, { keyPath: 'id', autoIncrement: true });
            }
          }
        }
      };

      request.onerror = () => {
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
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
