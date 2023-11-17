import { ChatHistory, ChatHistoryItem } from './types.js';

class Store extends EventTarget {
  activeHistoryIndex: number = 0;
  history: ChatHistoryItem[];
  threads: ChatHistory[];
  constructor() {
    super();
    this.threads = localStorage.getItem('threads') ? JSON.parse(localStorage.getItem('threads')) : [];
    this.history = [];
    this.#emit();
    console.log('store init', Math.random());
  }

  #writeToLocalStorage() {
    localStorage.setItem('threads', JSON.stringify(this.threads));
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
    this.threads[this.activeHistoryIndex] = this.history;
    this.#emit();
    this.#writeToLocalStorage();
  }

  selectHistory(index: number) {
    if (this.threads[index] === undefined) {
      this.threads[index] = [];
    }
    this.history = [];
    this.activeHistoryIndex = index;
    this.#emit();
  }
  clearOneThread(threadId: number = this.activeHistoryIndex) {
    this.threads[threadId] = [];
    this.#emit();
    this.#writeToLocalStorage();
  }
  subscribe<T>(key: string, cb: (value: T) => void) {
    const value = this[key] as T;
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
