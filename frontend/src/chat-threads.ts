import { css, html, LitElement } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { store } from './store.js';
import { Thread } from './types.js';
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
  @state() threads: Thread[] = [];
  @state() activeThreadId: number = 0;
  sub1: { unsubscribe: () => void };
  sub2: { unsubscribe: () => void };

  connectedCallback() {
    super.connectedCallback();
    this.sub1 = store.subscribe<Thread[]>('threads', (threads) => {
      this.threads = threads;
      this.requestUpdate();
      console.log('threads sub');
    });
    this.sub2 = store.subscribe<number>('activeThreadId', (idx) => {
      this.activeThreadId = idx;
      console.log('threads sub idx', this.activeThreadId);
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
            <div
              class="thread ${this.activeThreadId === thread.id ? 'active' : ''}"
              @click=${() => store.selectThread(thread.id)}>
              ${thread.headline}
            </div>
          `;
        })}
        <div class="thread" @click=${() => store.createNewThread()}>+ new thread</div>
      </section>
    `;
  }
}
