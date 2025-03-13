import type { ApiService } from '../services/api-service.js';

import { StateStore, prop } from 'go-web-framework/state-store.js';

import { ChatHistoryItem, Engine, IFile, SystemMessage, Thread } from '../types.js';
import { IDB } from './idb.js';

export class Store extends StateStore {
  private db: IDB = new IDB();
  @prop() activeThreadId: IDBValidKey;
  @prop() activeThread: Thread;
  @prop() threads: Thread[] = [];
  @prop() loading = false;
  @prop() stagedFiles: IFile[] = [];
  @prop() systemMessages: SystemMessage[] = [];

  constructor(private apiService: ApiService) {
    super();
    this.initDB().then(() => this.#emit('activeThread'));
  }

  async initDB() {
    await this.db.open();
    const count = await this.db.count('threads');
    if (count === 0) {
      const defaultThread = {
        id: 0,
        headline: 'default',
        system_message: 'This is the default thread',
        selected_engine: 'gpt-4o-mini' as Engine,
        include_context: true,
        history: []
      };
      const threadId = await this.db.put('threads', defaultThread);
      await this.db.put('indices', threadId, 'activeThreadId');
    }
    this.activeThreadId = (await this.db.get('indices', 'activeThreadId')) || 0;
    console.log('store activeThreadId', this.activeThreadId);
    this.threads = await this.db.getAll('threads');
    this.activeThread = {
      id: this.activeThreadId,
      ...(await this.db.get<Thread>('threads', this.activeThreadId))
    };
    this.systemMessages = await this.db.getAll<SystemMessage>('system_messages');
  }

  #emit = (key: string) => {
    this.dispatchEvent(
      new CustomEvent(key, {
        bubbles: true,
        composed: true
      })
    );
  };

  public async submitChat(prompt: string) {
    const message: ChatHistoryItem = {
      role: 'user',
      content: prompt,
      files: this.stagedFiles
    };
    await this.addMessage(message);
    this.loading = true;
    this.#emit('loading');
    const assistantMessage: ChatHistoryItem = {
      role: 'assistant',
      content: ''
    };
    const response = await this.apiService.postToChat(
      this.activeThread.history,
      this.activeThread.selected_engine,
      this.activeThread.system_message
    );
    this.addMessage(assistantMessage);
    this.stagedFiles = [];
    this.loading = false;
    this.#emit('loading');
    for await (const message of response) {
      this.addToMessageContent(message, this.activeThread.history.length - 1);
    }
  }

  async updateThread(thread: Partial<Thread>) {
    this.activeThread = {
      id: this.activeThreadId,
      ...this.activeThread,
      ...thread
    };
    await this.db.put('threads', this.activeThread);
    this.#emit('activeThread');
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
    this.#emit('activeThread');
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
    this.#emit('activeThread');
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
    this.#emit('activeThread');
  }

  async createNewThread() {
    const thread = {
      headline: 'thread',
      system_message: '',
      history: [],
      selected_engine: 'gpt-4o-mini' as Engine,
      include_context: true
    };
    this.activeThreadId = await this.db.add('threads', thread);
    this.activeThread = {
      id: this.activeThreadId,
      ...thread
    };
    this.threads = await this.db.getAll('threads');
    this.#emit('activeThread');
  }

  async deleteThread(threadId: IDBValidKey = this.activeThreadId) {
    await this.db.delete('threads', threadId);
    this.threads = await this.db.getAll('threads');
    if (threadId === this.activeThreadId) {
      this.activeThreadId = this.threads.length > 0 ? this.threads[0].id : null;
      this.activeThread = this.threads.length > 0 ? this.threads[0] : null;
    }
    await this.db.put('indices', this.activeThreadId, 'activeThreadId');
    this.#emit('activeThread');
  }

  async deleteChatHistoryItem(index: number, threadId: IDBValidKey = this.activeThreadId) {
    this.activeThread.history.splice(index, 1);
    await this.db.put('threads', this.activeThread);
    this.#emit('activeThread');
  }

  updateThreadName(threadId: IDBValidKey, name: string) {
    const thread = this.threads.find((t) => t.id === threadId);
    thread.headline = name;
    this.db.put('threads', thread);
    this.#emit('activeThread');
  }

  async saveSystemMessage(message: string) {
    const createdId = await this.db.add('system_messages', { text: message });
    this.systemMessages = await this.db.getAll<SystemMessage>('system_messages');
  }
  async updateSystemMessage(message: SystemMessage) {
    await this.db.put('system_messages', message);
    this.systemMessages = await this.db.getAll<SystemMessage>('system_messages');
  }
  async deleteSystemMessage(id: IDBValidKey) {
    await this.db.delete('system_messages', id);
    this.systemMessages = await this.db.getAll<SystemMessage>('system_messages');
  }
}
