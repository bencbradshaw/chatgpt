import { css, html, LitElement, nothing } from 'lit';
import { property, state } from 'lit/decorators.js';
import { store } from './store.js';
import { Thread } from './types.js';

export class ChatNav extends LitElement {
  static get styles() {
    return css`
      /* Your styles here */
      :host {
        height: auto;
      }
      button {
        margin: 0 10px;
        cursor: pointer;
        background-color: var(--button-bg-color);
        outline: none;
        border: none;
        padding: 0.25rem 1rem;
        color: var(--primary-font-color);
      }
      button:hover {
        background-color: var(--button-bg-color-hover);
      }
      button:active {
        background-color: var(--button-bg-color);
      }
    `;
  }
  @property({ type: String }) engine = sessionStorage.getItem('engine') ?? 'gpt-4o-mini';
  @property({ type: Boolean }) includeContext = JSON.parse(sessionStorage.getItem('include_context')) ?? true;
  @property({ type: String })
  systemMessage = sessionStorage.getItem('system_message') ?? `Your name is ChatGPT. You are a helpful assistant.`;
  @state() thread: Thread;
  @state() activeThreadId: IDBValidKey;
  sub1: { unsubscribe: () => void };

  connectedCallback() {
    super.connectedCallback();
    this.sub1 = store.subscribe<Thread>('activeThread', (thread) => {
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
      <nav>
        <div>
          <select
            id="engine"
            .value=${this.thread.selected_engine}
            @change=${(e) => {
              store.updateThread({ selected_engine: e.target.value });
            }}>
            <option value="gpt-4o-mini">4o mini</option>
            <option value="gpt-4o">4o</option>
            <option value="gpt-4-turbo">4 turbo</option>
            <option value="gpt-4">4</option>
            <option value="gpt-3.5-turbo">3.5 turbo</option>
            <option value="dall-e-3">DALL-E 3</option>
            <option value="vertex">Vertex Code Bison</option>
          </select>

          <textarea
            type="text"
            placeholder="System Message"
            .value=${this.thread.system_message}
            style="width: 300px;"
            @input=${(e) => {
              store.updateThread({ system_message: e.target.value });
            }} />
            </textarea>

          <button
            @click=${(e) => {
              store.deleteThread();
            }}>
            Delete Thread
          </button>
          <theme-toggle style="display: inline"></theme-toggle>
        </div>
      </nav>
    `;
  }
}

customElements.define('chat-nav', ChatNav);
