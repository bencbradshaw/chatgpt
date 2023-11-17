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

  connectedCallback() {
    super.connectedCallback();
    store.subscribe<ChatHistory[]>('threads', (threads) => {
      this.threads = threads;
      this.requestUpdate();
    });
  }
  disconnectedCallback(): void {
    store.unsubscribe('threads', () => {});
    super.disconnectedCallback();
  }
  render() {
    return html`
      <section>
        <p>threads</p>
        ${this.threads.map((thread) => html` <div class="thread">${thread[0].content.slice(0, 10) + '...'}</div> `)}
      </section>
    `;
  }
}
