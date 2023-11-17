import { IDBPDatabase, openDB } from 'idb';
import { ChatHistory, ChatHistoryItem } from './types.js';

class Store extends EventTarget {
  private db: IDBPDatabase;
  private activeHistoryIndex: number;
  private history: ChatHistoryItem[] = [];
  private threads: ChatHistory[] = [];

  constructor() {
    super();
    this.initDB().then(() => {
      this.#emit();
    });
  }

  async initDB() {
    this.db = await openDB('chatDB', 1, {
      upgrade(db) {
        db.createObjectStore('threads', { autoIncrement: true });
        db.createObjectStore('indices');
      }
    });
    this.activeHistoryIndex = (await this.db.get('indices', 'activeHistoryIndex')) || 0;
    this.threads = (await this.db.get('threads', 1)) || [];
    this.history = this.threads[this.activeHistoryIndex] || [];
  }

  async #writeToIndexedDB() {
    await this.db.put('threads', this.threads, 1);
    await this.db.put('indices', this.activeHistoryIndex, 'activeHistoryIndex');
  }

  #emit() {
    this.dispatchEvent(
      new CustomEvent('history-change', {
        bubbles: true,
        composed: true
      })
    );
  }

  async addMessage(message: ChatHistoryItem) {
    this.history.push(message);
    this.threads[this.activeHistoryIndex] = this.history;
    this.#emit();
    this.#writeToIndexedDB();
  }

  async addToMessageContent(message: string, index: number) {
    this.history[index].content += message;
    this.history = [...this.history];
    this.threads[this.activeHistoryIndex] = this.history;
    this.#writeToIndexedDB();
    this.#emit();
  }

  async selectHistory(index: number) {
    if (!this.threads[index]) {
      this.threads[index] = [];
    }
    this.history = this.threads[index];
    this.activeHistoryIndex = index;
    this.#writeToIndexedDB();
    this.#emit();
  }

  async createNewThread() {
    this.threads.push([]);
    this.#writeToIndexedDB();
    this.selectHistory(this.threads.length - 1);
  }

  async clearOneThread(threadId: number = this.activeHistoryIndex) {
    this.threads[threadId] = [];
    this.#writeToIndexedDB();
    this.#emit();
  }

  async deleteItem(chatItemId: number, threadId = this.activeHistoryIndex) {
    // Implement deletion logic
  }

  subscribe<T>(key: string, cb: (value: T) => void) {
    const value = this[key] as T;
    cb(value);
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
