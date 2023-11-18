import { IDB } from './idb.js';
import { ChatHistoryItem, Thread } from './types.js';

class Store extends EventTarget {
  private db: IDB = new IDB();
  private activeThreadId: IDBValidKey;
  private activeThread: Thread;
  private threads: Thread[] = [];

  constructor() {
    super();
    this.initDB().then(this.#emit);
  }

  async initDB() {
    await this.db.open();
    const count = await this.db.count('threads');
    if (count === 0) {
      const defaultThread = {
        id: 0,
        headline: 'Default',
        system_message: 'This is the default thread',
        history: []
      };
      const threadId = await this.db.put('threads', defaultThread);
      await this.db.put('indices', threadId, 'activeThreadId');
    }
    this.activeThreadId = (await this.db.get('indices', 'activeThreadId')) || 0;
    this.threads = await this.db.getAll('threads');
    this.activeThread = {
      id: this.activeThreadId,
      ...(await this.db.get<Thread>('threads', this.activeThreadId))
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
    this.db.put('threads', this.activeThread);
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
    this.db.put('threads', this.activeThread);
  }

  async selectThread(threadId: IDBValidKey) {
    this.activeThreadId = threadId;
    this.activeThread = {
      id: this.activeThreadId,
      ...(await this.db.get<Thread>('threads', threadId))
    };
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
    this.threads = await this.db.getAll('threads');
    this.#emit();
  }

  async deleteThread(threadId: IDBValidKey = this.activeThreadId) {
    await this.db.delete('threads', threadId);
    this.threads = await this.db.getAll('threads');
    if (threadId === this.activeThreadId) {
      this.activeThreadId = this.threads.length > 0 ? this.threads[0].id : null;
      this.activeThread = this.threads.length > 0 ? this.threads[0] : null;
    }
    await this.db.put('indices', this.activeThreadId, 'activeThreadId');
    this.#emit();
  }

  async deleteChatHistoryItem(threadId: IDBValidKey = this.activeThreadId, index: number) {
    if (!threadId || index < 0 || index >= this.activeThread.history.length) {
      return;
    }
    this.activeThread.history.splice(index, 1);
    await this.db.put('threads', this.activeThread);
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
