import { ChatHistory, ChatHistoryItem } from './types.js';

class Store extends EventTarget {
  activeHistoryIndex: number = 0;
  history: ChatHistoryItem[];
  threads: ChatHistory[];
  constructor() {
    super();
    this.threads = localStorage.getItem('threads') ? JSON.parse(localStorage.getItem('threads')) : [];
    this.history = [];
    this.dispatchEvent(
      new CustomEvent('history-change', {
        bubbles: true,
        composed: true
      })
    );
  }

  #writeToLocalStorage() {
    localStorage.setItem('threads', JSON.stringify(this.threads));
  }

  addMessage(message: ChatHistoryItem) {
    this.history.push(message);
    this.threads[this.activeHistoryIndex] = this.history;
    this.dispatchEvent(
      new CustomEvent('history-change', {
        bubbles: true,
        composed: true
      })
    );
    this.#writeToLocalStorage();
  }

  addToMessageContent(message: string, index: number) {
    this.history[index].content += message;
    this.threads[this.activeHistoryIndex] = this.history;
    this.dispatchEvent(
      new CustomEvent('history-change', {
        bubbles: true,
        composed: true
      })
    );
    this.#writeToLocalStorage();
  }

  selectHistory(index: number) {
    if (this.threads[index] === undefined) {
      this.threads[index] = [];
    }
    this.history = [];
    this.activeHistoryIndex = index;
    this.dispatchEvent(
      new CustomEvent('history-change', {
        bubbles: true,
        composed: true
      })
    );
  }

  subscribe<T>(key: string, cb: (value: T) => void) {
    this.addEventListener('history-change', () => {
      cb(this[key]);
    });
  }

  unsubscribe(key: string, cb: (value) => void) {
    this.removeEventListener('history-change', () => {
      cb(this[key]);
    });
  }
}

export const store = new Store();
