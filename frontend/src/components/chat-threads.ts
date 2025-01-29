import type { Store } from '../state/store.js';
import { css, html, LitElement, nothing } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { Thread } from '../types.js';
import '../atomics/theme-toggle.js';
import { consume, createContext } from '@lit/context';

@customElement('chat-threads')
export class ChatThreads extends LitElement {
  static styles = css`
    :host {
      position: fixed;
      left: 0;
      top: 0;
      bottom: 0;
      border-right: 1px solid white;
      padding: 0 0.5rem;
    }
    .section {
      display: flex;
      flex-direction: column;
    }
    .thread {
      box-sizing: border-box;
      border: 1px solid transparent;
      margin: 1rem 0;
      padding: 0.25rem;
    }
    .active {
      border: 1px solid #939393;
    }
    .thread:hover {
      border: 1px solid white;
      cursor: pointer;
    }
  `;
  @state() threads: Thread[] = [];
  @state() activeThreadId: IDBValidKey;
  sub1: { unsubscribe: () => void };
  sub2: { unsubscribe: () => void };
  @consume({ context: createContext<Store>('chat-store') }) store: Store;
  connectedCallback() {
    super.connectedCallback();
    this.sub1 = this.store.subscribe<Thread[]>('threads', (threads) => {
      this.threads = threads;
      this.requestUpdate();
    });
    this.sub2 = this.store.subscribe<number>('activeThreadId', (idx) => {
      this.activeThreadId = idx;
    });
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.sub1.unsubscribe();
    this.sub2.unsubscribe();
  }

  render() {
    if (!this.threads.length || this.activeThreadId === undefined) return nothing;
    return html`
      <section>
        ${this.threads.map((thread, i) => {
          return html`
            <div
              class="thread ${this.activeThreadId === thread.id ? 'active' : ''}"
              @click=${() => this.store.selectThread(thread.id)}>
              ${thread.headline.slice(0, 10) + '...'}
            </div>
          `;
        })}
        <div class="thread" @click=${() => this.store.createNewThread()}>+ new thread</div>
      </section>
    `;
  }
}
