import { css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { store } from './store.js';
import { ChatHistory } from './types.js';
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
      color: white;
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
  @property({ type: Array }) threads: ChatHistory[] = [];
  @property({ type: Number }) activeHistoryIndex: number = 0;
  sub1: { unsubscribe: () => void };
  sub2: { unsubscribe: () => void };
  connectedCallback() {
    super.connectedCallback();
    this.sub1 = store.subscribe<ChatHistory[]>('threads', (threads) => {
      this.threads = threads;
    });
    this.sub2 = store.subscribe<number>('activeHistoryIndex', (idx) => {
      this.activeHistoryIndex = idx;
    });
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.sub1.unsubscribe();
    this.sub2.unsubscribe();
  }

  render() {
    return html`
      <section>
        ${this.threads.map((thread, i) => {
          return html`
            <div class="thread ${this.activeHistoryIndex === i ? 'active' : ''}" @click=${() => store.selectHistory(i)}>
              ${(thread?.length ? thread : [])[0]?.content?.slice(0, 10) + '...' || 'empty thread'}
            </div>
          `;
        })}
        <div class="thread" @click=${() => store.createNewThread()}>+ new thread</div>
      </section>
    `;
  }
}
