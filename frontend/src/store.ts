import { ChatHistory, ChatHistoryItem } from './types.js';

class Store extends EventTarget {
  private activeHistoryIndex: number;
  private history: ChatHistoryItem[];
  private threads: ChatHistory[];
  constructor() {
    super();
    this.activeHistoryIndex = localStorage.getItem('activeHistoryIndex')
      ? Number(localStorage.getItem('activeHistoryIndex'))
      : 0;
    this.threads = localStorage.getItem('threads') ? JSON.parse(localStorage.getItem('threads')) : [];
    this.history = this.threads[this.activeHistoryIndex] || [];
    this.#emit();
    console.log('store init', Math.random());
  }

  #writeToLocalStorage() {
    localStorage.setItem('threads', JSON.stringify(this.threads));
    localStorage.setItem('activeHistoryIndex', this.activeHistoryIndex.toString());
  }

  #emit() {
    this.dispatchEvent(
      new CustomEvent('history-change', {
        bubbles: true,
        composed: true
      })
    );
  }

  addMessage(message: ChatHistoryItem) {
    this.history.push(message);
    this.threads[this.activeHistoryIndex] = this.history;
    this.#emit();
    this.#writeToLocalStorage();
  }

  addToMessageContent(message: string, index: number) {
    this.history[index].content += message;
    this.history = [...this.history]; // create a new ref
    this.threads[this.activeHistoryIndex] = this.history;
    this.threads = [...this.threads]; // create a new ref
    this.#emit();
    this.#writeToLocalStorage();
  }

  selectHistory(index: number) {
    if (this.threads[index] === undefined) {
      this.threads[index] = [];
    }
    this.history = this.threads[index];
    this.activeHistoryIndex = index;
    this.#writeToLocalStorage();
    this.#emit();
  }
  createNewThread() {
    this.threads.push([]);
    this.selectHistory(this.threads.length - 1);
    this.#emit();
  }
  clearOneThread(threadId: number = this.activeHistoryIndex) {
    this.threads[threadId] = [];
    this.#emit();
    this.#writeToLocalStorage();
  }
  deleteItem(chatItemId: number, threadId = this.activeHistoryIndex) {}
  subscribe<T>(key: string, cb: (value: T) => void) {
    const value = this[key] as T;
    console.log(value);
    cb(value);
    const eventListener = (event: Event) => {
      const value: T = this[key];
      cb(value);
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
