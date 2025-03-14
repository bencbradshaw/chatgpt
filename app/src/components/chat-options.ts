import { consume, createContext } from '@lit/context';
import { LitElement, css, html, nothing } from 'lit';
import { property, state } from 'lit/decorators.js';
import { FloatingMenu } from '../atomics/floating-menu.js';
import type { Store } from '../state/store.js';
import { buttonsCss } from '../styles/buttons.css.js';
import { textareaCss } from '../styles/textarea.css.js';
import typography from '../styles/typography.js';
import { SystemMessage, Thread } from '../types.js';
const threeDotSvg = html`
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="5" r="2" fill="currentColor" />
    <circle cx="12" cy="12" r="2" fill="currentColor" />
    <circle cx="12" cy="19" r="2" fill="currentColor" />
  </svg>
`;
export class ChatOptions extends LitElement {
  static styles = [
    buttonsCss,
    textareaCss,
    typography,
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
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 12px;
        select {
          margin: 0 5px;
        }
        textarea {
          margin: 0 5px;
        }
      }
      dialog {
        border: 1px solid black;
        outline: none;
        background-color: var(--color-primary-100);
        color: var(--primary-font-color);
        min-width: 400px;
        max-width: 800px;
        padding: 0;
        .wrapper {
          display: flex;
          flex-direction: column;
          padding: 0;
          .scrollable {
            align-self: stretch;
            flex-direction: column;
            align-items: stretch;
            justify-items: flex-start;
            overflow-y: auto;
            max-height: 500px;
            p {
              cursor: pointer;
              &.active {
                background-color: var(--color-accent-100);
                color: var(--primary-font-color);
              }
            }
          }
          .buttons {
            align-self: stretch;
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: flex-end;
          }
        }
        &::backdrop {
          background-color: rgba(0, 0, 0, 0.5);
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
  @state() stagedSystemMessage: SystemMessage;
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
            ${threeDotSvg}
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
            <option value="llama-3.3-70b">Llama 3.3 70B</option>
            <option value="llama-3.2-3b">Llama 3.2 3B</option>
            <option value="dolphin-2.9.2-qwen2-72b">Dolphin 2.9.2 Qwen2 72B</option>
            <option value="llama-3.1-405b">Llama 3.1 405B</option>
            <option value="qwen2.5-coder-32b">Qwen 2.5 Coder 32B</option>
            <option value="deepseek-r1-671b">Deepseek R1 671B</option>
            <option value="deepseek-r1-llama-70b">Deepseek R1 Llama 70B</option>
            <option value="qwen-2.5-vl">Qwen 2.5 VL</option>
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
            <button @click=${() => this.shadowRoot.querySelector('dialog').showModal()}>
            ${threeDotSvg}
          </button>
          </div>
        </floating-menu>
        <dialog>
          <div class="wrapper">
            <div class="scrollable">

              ${this.store.systemMessages.map((message) => {
                return html`<p
                  class=${this.stagedSystemMessage === message ? 'active' : ''}
                  @click=${() => {
                    this.stagedSystemMessage = message;
                  }}>
                  ${message.text}
                </p>`;
              })}
              </div>
              <div class="buttons">
              <button @click=${() => this.shadowRoot.querySelector('dialog').close()}>Cancel</button>

                <button
                @click=${() => {
                  this.store.updateThread({ system_message: this.stagedSystemMessage.text });
                  this.shadowRoot.querySelector('dialog').close();
                  this.stagedSystemMessage = null;
                }}>
                Select
              </button>
              </div>
      </div>
        </dialog>
    `;
  }
}

customElements.define('chat-options', ChatOptions);
