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
    }
    .thread:hover {
      border: 1px solid white;
      cursor: pointer;
    }
  `;
  @property({ type: Array }) threads: ChatHistory[] = [];
  subscription: { unsubscribe: () => void };
  connectedCallback() {
    super.connectedCallback();
    this.subscription = store.subscribe<ChatHistory[]>('threads', (threads) => {
      this.threads = threads;
      console.log('threads', threads);
    });
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.subscription.unsubscribe();
  }

  render() {
    return html`
      <section>
        ${this.threads.map(
          (thread, i) =>
            html`
              <div class="thread" @click=${() => store.selectHistory(i)}>${thread[0].content.slice(0, 10) + '...'}</div>
            `
        )}
        <div class="thread" @click=${() => store.createNewThread()}>+ new thread</div>
      </section>
    `;
  }
}
