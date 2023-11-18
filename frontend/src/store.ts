import { DBSchema, IDBPDatabase, openDB } from 'idb';
import { ChatHistoryItem, Thread } from './types.js';

interface ChatGPTDB extends DBSchema {
  threads: {
    key: number;
    value: Thread;
  };
  indices: {
    key: string;
    value: number;
  };
}
class Store extends EventTarget {
  private db: IDBPDatabase<ChatGPTDB>;
  private activeThreadId: number;
  private activeThread: Thread;
  private threads: Thread[] = [];

  constructor() {
    super();

    this.initDB().then(this.#emit);
  }
  async getAllWithKeys(storeName: 'threads' | 'indices') {
    const keys = await this.db.getAllKeys(storeName);
    const values = await Promise.all(keys.map((key) => this.db.get(storeName, key)));
    return values.map((value, index) => ({ id: keys[index], ...value }));
  }
  async initDB() {
    this.db = await openDB<ChatGPTDB>('chatDB', 1, {
      upgrade(db) {
        db.createObjectStore('threads', { autoIncrement: true });
        db.createObjectStore('indices');
      }
    });
    const count = await this.db.count('threads');
    if (count === 0) {
      const defaultThread = {
        headline: 'Default',
        system_message: 'This is the default thread',
        history: []
      };
      const threadId = await this.db.add('threads', defaultThread);
      await this.db.put('indices', threadId, 'activeThreadId');
    }
    this.activeThreadId = (await this.db.get('indices', 'activeThreadId')) || 0;
    this.threads = await this.getAllWithKeys('threads');
    this.activeThread = {
      id: this.activeThreadId,
      ...(await this.db.get('threads', this.activeThreadId))
    };
  }

  #emit = () => {
    this.dispatchEvent(
      new CustomEvent('history-change', {
        bubbles: true,
        composed: true
      })
    );
  };

  async addMessage(message: ChatHistoryItem) {
    this.activeThread = {
      id: this.activeThreadId,
      headline: this.activeThread.headline || message.content,
      system_message: this.activeThread.system_message,
      history: [...this.activeThread.history, message]
    };
    this.#emit();
    // slip
    this.db.put('threads', this.activeThread, this.activeThreadId);
  }

  async addToMessageContent(message: string, index: number) {
    this.activeThread.history[index].content += message;
    this.activeThread = {
      id: this.activeThreadId,
      headline: this.activeThread.headline,
      system_message: this.activeThread.system_message,
      history: this.activeThread.history
    };
    this.#emit();
    // slip
    this.db.put('threads', this.activeThread, this.activeThreadId);
  }

  async selectThread(threadId: number) {
    this.activeThreadId = threadId;
    this.activeThread = { id: this.activeThreadId, ...(await this.db.get('threads', threadId)) };
    this.#emit();
  }

  async createNewThread() {
    const thread = {
      headline: 'thread',
      system_message: '',
      history: []
    };
    this.activeThreadId = await this.db.add('threads', thread);
    this.activeThread = {
      id: this.activeThreadId,
      ...thread
    };
    this.#emit();
  }

  async clearOneThread(threadId: number = this.activeThreadId) {
    this.#emit();
  }

  async deleteItem(threadId = this.activeThreadId) {
    this.#emit();
  }

  subscribe<T>(key: string, cb: (value: T) => void) {
    const value = this[key] as T;
    if (value) {
      cb(value);
    }
    const eventListener = (event: Event) => {
      cb(this[key]);
    };
    this.addEventListener('history-change', eventListener);
    return {
      unsubscribe: () => {
        this.removeEventListener('history-change', eventListener);
      }
    };
  }
}

export const store = new Store();
