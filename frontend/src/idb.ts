export class iDB {
  private db: IDBDatabase;
  constructor(private dbName: string = 'chat-gpt', private stores: string[] = ['threads', 'indices']) {}

  open(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      if (this.db) {
        resolve(this.db);
        return;
      }

      const request = indexedDB.open(this.dbName, 1);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const storeNames = Array.from(db.objectStoreNames);
        for (const store of this.stores) {
          if (!storeNames.includes(store) && store !== 'indices') {
            db.createObjectStore(store, { keyPath: 'id', autoIncrement: true });
          }
          if (!storeNames.includes(store) && store === 'indices') {
            db.createObjectStore(store);
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

  count(storeName: string) {
    return new Promise<number>((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readonly');
      const objectStore = transaction.objectStore(storeName);
      const request = objectStore.count();

      request.onerror = () => {
        reject(request.error);
      };

      request.onsuccess = () => {
        resolve(request.result);
      };
    });
  }

  get<T>(storeName: string, key: IDBValidKey): Promise<T | undefined> {
    return new Promise<T | undefined>((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readonly');
      const objectStore = transaction.objectStore(storeName);
      const request = objectStore.get(key);

      request.onerror = () => {
        reject(request.error);
      };

      request.onsuccess = () => {
        resolve(request.result);
      };
    });
  }

  put<T>(storeName: string, value: T, outlineKey?: IDBValidKey): Promise<IDBValidKey> {
    return new Promise<IDBValidKey>((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const objectStore = transaction.objectStore(storeName);
      let request;
      if (outlineKey) {
        request = objectStore.put(value, outlineKey);
      } else {
        request = objectStore.put(value);
      }

      request.onerror = () => {
        reject(request.error);
      };

      request.onsuccess = () => {
        resolve(request.result);
      };
    });
  }

  add<T>(storeName: string, value: T): Promise<IDBValidKey> {
    return new Promise<IDBValidKey>((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const objectStore = transaction.objectStore(storeName);
      const request = objectStore.add(value);

      request.onerror = () => {
        reject(request.error);
      };

      request.onsuccess = () => {
        resolve(request.result);
      };
    });
  }

  getAll<T>(storeName: string, includeKeys: boolean = false): Promise<(T & { key?: IDBValidKey })[]> {
    return new Promise<any>((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readonly');
      const objectStore = transaction.objectStore(storeName);
      const getData = objectStore.getAll();
      const getKeys = includeKeys ? objectStore.getAllKeys() : null;

      const errorHandler = (event: Event) => {
        reject((event.target as IDBRequest).error);
      };

      getData.onerror = errorHandler;

      if (getKeys) getKeys.onerror = errorHandler;

      getData.onsuccess = () => {
        if (getKeys) {
          getKeys.onsuccess = () => {
            const data = getData.result;
            const keys = getKeys.result;
            const combinedResults = data.map((item, index) => ({ ...item, key: keys[index] }));
            resolve(combinedResults);
          };
        } else {
          resolve(getData.result);
        }
      };
    });
  }
}
