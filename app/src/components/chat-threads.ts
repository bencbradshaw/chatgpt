import { consume, createContext } from '@lit/context';
import { LitElement, css, html, nothing } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import '../atomics/theme-toggle.js';
import type { Store } from '../state/store.js';
import { buttonsCss } from '../styles/buttons.css.js';
import { Thread } from '../types.js';

@customElement('chat-threads')
export class ChatThreads extends LitElement {
  static styles = [
    buttonsCss,
    css`
      :host {
        flex-grow: 1;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
      }
      section {
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: stretch;
        &[upper] {
          padding-top: 1rem;
          .thread {
            box-sizing: border-box;
            border: 1px solid transparent;
            border-radius: 0 5px 5px 0;
            padding: 1rem 0.25rem;
          }
          .active {
            background-color: #939393;
          }
          .thread:hover {
            background-color: #93939395;
            cursor: pointer;
          }
          button.new-thread {
            margin-top: 1rem;
          }
        }
        &[lower] {
          theme-toggle {
            margin: 0 1rem;
          }
        }
      }
    `
  ];
  @state() threads: Thread[] = [];
  @state() activeThreadId: IDBValidKey;
  sub1: { unsubscribe: () => void };
  sub2: { unsubscribe: () => void };
  @consume({ context: createContext<Store>('chat-store') }) store: Store;
  connectedCallback() {
    super.connectedCallback();
    this.sub1 = this.store.subscribe('threads', (threads) => {
      this.threads = threads;
      console.log('chat threads threads', threads);
      this.requestUpdate();
    });
    this.sub2 = this.store.subscribe('activeThreadId', (idx) => {
      this.activeThreadId = idx;
      console.log('chat threads activeThreadId', idx);
    });
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.sub1.unsubscribe();
    this.sub2.unsubscribe();
  }
  sliceHeadline(headline: string) {
    if (headline.length < 23) return headline;
    return headline.slice(0, 23) + '...';
  }
  render() {
    if (!this.threads.length || this.activeThreadId === undefined) return nothing;
    return html`
      <section upper>
        ${this.threads.map((thread, i) => {
          return html`
            <floating-menu>
              <div
                slot="invoker"
                class="thread ${this.activeThreadId === thread.id ? 'active' : ''}"
                @click=${() => this.store.selectThread(thread.id)}>
                ${this.sliceHeadline(thread.headline)}
              </div>
              <div>
                <button @click=${() => this.store.deleteThread(thread.id)}>delete</button>
              </div>
            </floating-menu>
          `;
        })}
        <button class="new-thread" @click=${() => this.store.createNewThread()}>new thread</button>
      </section>
      <section lower>
        <theme-toggle> </theme-toggle>
      </section>
    `;
  }
}
