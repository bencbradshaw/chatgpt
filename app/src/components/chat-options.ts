import { consume, createContext } from '@lit/context';
import { LitElement, css, html, nothing } from 'lit';
import { property, state } from 'lit/decorators.js';
import { FloatingMenu } from '../atomics/floating-menu.js';
import type { Store } from '../state/store.js';
import { buttonsCss } from '../styles/buttons.css.js';
import { textareaCss } from '../styles/textarea.css.js';
import { Thread } from '../types.js';

export class ChatOptions extends LitElement {
  static styles = [
    buttonsCss,
    textareaCss,
    css`
      button[slot='invoker'] {
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: transparent;
        &:hover,
        &:active,
        &:focus {
          background-color: var(--color-primary-300);
        }
      }
      div {
        background-color: var(--color-primary-100);
        padding: 1rem;
        display: flex;
        align-items: center;
        justify-content: center;
        select {
          margin: 0 5px;
        }
        textarea {
          margin: 0 5px;
        }
      }
    `
  ];

  @property({ type: String }) engine = sessionStorage.getItem('engine') ?? 'gpt-4o-mini';
  @property({ type: Boolean }) includeContext = JSON.parse(sessionStorage.getItem('include_context')) ?? true;
  @property({ type: String })
  systemMessage = sessionStorage.getItem('system_message') ?? `Your name is ChatGPT. You are a helpful assistant.`;
  @state() thread: Thread;
  @state() activeThreadId: IDBValidKey;
  sub1: { unsubscribe: () => void };
  @consume({ context: createContext<Store>('chat-store') }) store: Store;
  connectedCallback() {
    super.connectedCallback();
    this.sub1 = this.store.subscribe('activeThread', (thread) => {
      this.thread = thread;
      this.requestUpdate();
    });
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.sub1.unsubscribe();
  }

  render() {
    if (!this.thread) return nothing;
    return html`
        <floating-menu position="top">
          <button slot="invoker">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="5" r="2" fill="currentColor"/>
              <circle cx="12" cy="12" r="2" fill="currentColor"/>
              <circle cx="12" cy="19" r="2" fill="currentColor"/>
            </svg>
          </button>
          <div>
            <select
            id="engine"
            .value=${this.thread.selected_engine}
            @change=${(e) => {
              this.store.updateThread({ selected_engine: e.target.value });
            }}>
            <option value="gpt-4o-mini">4o mini</option>
            <option value="gpt-4o">4o</option>
          </select>
          
          <textarea
          type="text"
          placeholder="System Message"
          .value=${this.thread.system_message}
          style="width: 300px; height: 16px;"
          @input=${(e) => {
            this.store.updateThread({ system_message: e.target.value });
          }}
          @keydown=${(e) => {
            if (e.key === 'Enter') {
              const floatingMenu = this.shadowRoot.querySelector('floating-menu') as FloatingMenu;
              floatingMenu.close();
            }
          }} />
            </textarea>
            
          </div>
        </floating-menu>
    `;
  }
}

customElements.define('chat-options', ChatOptions);
