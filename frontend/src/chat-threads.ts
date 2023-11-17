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
    }
    .section {
      display: flex;
      flex-direction: column;
    }
    .thread {
      color: white;
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
        <p>threads</p>
        ${this.threads.map(
          (thread, i) =>
            html`
              <div class="thread" @click=${() => store.selectHistory(i)}>${thread[0].content.slice(0, 10) + '...'}</div>
            `
        )}
      </section>
    `;
  }
}
