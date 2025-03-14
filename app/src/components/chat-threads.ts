import { consume, createContext } from '@lit/context';
import { LitElement, css, html, nothing } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import type { FloatingMenu } from '../atomics/floating-menu.js';
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
            display: flex;
            justify-content: space-between;
            align-items: center;
            p {
              margin: 0;
              padding: 0 0 0 0.25rem;
              font-size: 1rem;
              font-weight: 500;
              // no select
              user-select: none;
              background-color: transparent;
              &[contenteditable='true'] {
                background-color: var(--color-primary-100);
                outline: none;
                border: var(--color-accent-100) solid 1px;
                min-width: 158px;
                padding: 0 2px;
                margin: 0 -2px;
                border-radius: 4px;
              }
            }
            button:not(floating-menu div button) {
              background-color: transparent;
              padding: 2px;
              margin: 0;
              &:hover {
                background-color: var(--color-primary-200);
              }
              &:active,
              &:focus {
                background-color: var(--color-primary-300);
              }
            }
            .menu {
              display: flex;
              flex-direction: column;
              padding: 0.5rem 0.25rem;
              gap: 0.5rem;
              background-color: var(--color-primary-100);
            }
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
    if (headline.length < 19) return headline;
    return headline.slice(0, 19) + '...';
  }

  #handleRename = async (thread: Thread) => {
    this.shadowRoot.querySelector<FloatingMenu>('floating-menu').close();
    const pEl = this.shadowRoot.querySelector<HTMLParagraphElement>(`#thread-${thread.id}`);
    pEl.innerText = thread.headline;
    pEl.contentEditable = 'true';
    await new Promise((resolve) => setTimeout(resolve, 100));
    pEl.focus();
    const range = document.createRange();
    const selection = window.getSelection();
    range.selectNodeContents(pEl);
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
  };

  #handleBlur = (e: FocusEvent & { target: HTMLParagraphElement }) => {
    if (e.target.contentEditable === 'true') {
      e.target.contentEditable = 'false';
      this.store.updateThreadName(this.activeThreadId, e.target.innerText);
    }
  };
  #handleKeyPress = (e: KeyboardEvent & { target: HTMLParagraphElement }) => {
    if (e.target.contentEditable === 'true') {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        e.target.blur();
      }
    }
  };

  render() {
    if (!this.threads.length || this.activeThreadId === undefined) return nothing;
    return html`
      <section upper>
        ${this.threads.map((thread, i) => {
          return html`
            <div class="thread" @click=${() => this.store.selectThread(thread.id)}>
              <p
                id=${'thread-' + thread.id}
                class="${this.activeThreadId === thread.id ? 'active' : ''}"
                @blur=${this.#handleBlur}
                @keypress=${this.#handleKeyPress}>
                ${this.sliceHeadline(thread.headline)}
              </p>
              <floating-menu>
                <button slot="invoker">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="5" r="2" fill="currentColor" />
                    <circle cx="12" cy="12" r="2" fill="currentColor" />
                    <circle cx="12" cy="19" r="2" fill="currentColor" />
                  </svg>
                </button>
                <div class="menu">
                  <button
                    @click=${(e) => {
                      e.stopPropagation();
                      this.#handleRename(thread);
                    }}>
                    rename
                  </button>
                  <button
                    @click=${(e) => {
                      e.stopPropagation();
                      this.store.deleteThread(thread.id);
                    }}>
                    delete
                  </button>
                </div>
              </floating-menu>
            </div>
          `;
        })}
        <button class="new-thread" @click=${() => this.store.createNewThread()}>new thread</button>
      </section>
      <section lower></section>
    `;
  }
}
