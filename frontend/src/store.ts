import { IDB } from './idb.js';
import { ChatHistoryItem, Engine, Thread } from './types.js';

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
        headline: 'default',
        system_message: 'This is the default thread',
        selected_engine: 'gpt-4-1106-preview' as Engine,
        include_context: true,
        history: []
      };
      const threadId = await this.db.put('threads', defaultThread);
      await this.db.put('indices', threadId, 'activeThreadId');
    }
    this.activeThreadId = (await this.db.get('indices', 'activeThreadId')) || 0;
    console.log('stroe activeThreadId', this.activeThreadId);
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

  async updateThread(thread: Partial<Thread>) {
    this.activeThread = {
      id: this.activeThreadId,
      ...this.activeThread,
      ...thread
    };
    await this.db.put('threads', this.activeThread);
    this.#emit();
  }

  async addMessage(message: ChatHistoryItem) {
    this.activeThread = {
      id: this.activeThreadId,
      headline:
        this.activeThread.headline === 'thread' || this.activeThread.headline === 'default'
          ? message.content
          : this.activeThread.headline,
      system_message: this.activeThread.system_message,
      selected_engine: this.activeThread.selected_engine,
      include_context: this.activeThread.include_context,
      history: [...this.activeThread.history, message]
    };
    await this.db.put('threads', this.activeThread);
    this.#emit();
  }

  async addToMessageContent(message: string, index: number) {
    this.activeThread.history[index].content += message;
    this.activeThread = {
      id: this.activeThreadId,
      headline: this.activeThread.headline,
      system_message: this.activeThread.system_message,
      selected_engine: this.activeThread.selected_engine,
      include_context: this.activeThread.include_context,
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
    await this.db.put('indices', this.activeThreadId, 'activeThreadId');
    this.#emit();
  }

  async createNewThread() {
    const thread = {
      headline: 'thread',
      system_message: '',
      history: [],
      selected_engine: 'gpt-4-1106-preview' as Engine,
      include_context: true
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

  async deleteChatHistoryItem(index: number, threadId: IDBValidKey = this.activeThreadId) {
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
