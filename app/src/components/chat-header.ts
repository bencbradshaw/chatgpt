import { consume, createContext } from '@lit/context';
import { LitElement, css, html, nothing } from 'lit';
import { property, state } from 'lit/decorators.js';
import type { Store } from '../state/store.js';
import { buttonsCss } from '../styles/buttons.css.js';
import { textareaCss } from '../styles/textarea.css.js';
import { Thread } from '../types.js';

export class ChatHeader extends LitElement {
  static styles = [
    buttonsCss,
    textareaCss,
    css`
      :host {
        height: auto;
        position: relative;
        align-self: flex-start;
      }
      floating-menu {
        display: block;
        width: 30px;
      }
      div {
        display: flex;
        align-items: center;
        justify-content: center;
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
            ooo
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
          }} />
            </textarea>
            
          </div>
        </floating-menu>
    `;
  }
}

customElements.define('chat-header', ChatHeader);
