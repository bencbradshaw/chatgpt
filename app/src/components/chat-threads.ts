import { consume, createContext } from '@lit/context';
import { LitElement, html, nothing } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import type { FloatingMenu } from '../atomics/floating-menu.js';
import '../atomics/theme-toggle.js';
import type { Store } from '../state/store.js';
import { Thread } from '../types.js';
import styles from './chat-threads.css.js';

@customElement('chat-threads')
export class ChatThreads extends LitElement {
  static styles = styles;
  @state() threads: Thread[] = [];
  @state() activeThreadId: IDBValidKey;
  #renamingThreadId: IDBValidKey | null = null;
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
    const linkEl = this.shadowRoot.querySelector<HTMLAnchorElement>(`#thread-${thread.id}`);
    if (!linkEl) return;
    this.#renamingThreadId = thread.id;
    linkEl.innerText = thread.headline;
    linkEl.setAttribute('router-ignore', '');
    linkEl.contentEditable = 'true';
    await new Promise((resolve) => setTimeout(resolve, 100));
    linkEl.focus();
    const range = document.createRange();
    const selection = window.getSelection();
    if (!selection) return;
    range.selectNodeContents(linkEl);
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
  };

  #handleThreadMouseDown = (e: MouseEvent & { currentTarget: HTMLAnchorElement }): void => {
    if (e.currentTarget.contentEditable === 'true') {
      // Keep the event from reaching the document-level router click handler.
      // Don't preventDefault here or it can interfere with cursor placement.
      e.stopPropagation();
    }
  };

  #handleThreadClick = (e: MouseEvent & { currentTarget: HTMLAnchorElement }): void => {
    if (e.currentTarget.contentEditable === 'true') {
      // Prevent navigation while editing.
      e.preventDefault();
      e.stopPropagation();
    }
  };

  #handleBlur = (e: FocusEvent & { target: HTMLAnchorElement }): void => {
    if (e.target.contentEditable === 'true') {
      e.target.contentEditable = 'false';
      e.target.removeAttribute('router-ignore');
      const threadId = this.#renamingThreadId ?? this.activeThreadId;
      this.#renamingThreadId = null;
      this.store.updateThreadName(threadId, e.target.innerText);
    }
  };

  #handleKeyPress = (e: KeyboardEvent & { target: HTMLAnchorElement }): void => {
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
            <div class="thread">
              <a
                href="/app/chat/${thread.id}"
                id=${'thread-' + thread.id}
                class="${this.activeThreadId === thread.id ? 'active' : ''}"
                @mousedown=${this.#handleThreadMouseDown}
                @click=${this.#handleThreadClick}
                @blur=${this.#handleBlur}
                @keypress=${this.#handleKeyPress}>
                ${this.sliceHeadline(thread.headline)}
              </a>
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
