import { css, html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { store } from './store.js';

export class ChatNav extends LitElement {
  static get styles() {
    return css`
      /* Your styles here */
      :host {
        height: 25px;
      }
      button {
        margin: 0 10px;
        cursor: pointer;
        background-color: var(--button-bg-color);
        outline: none;
        border: none;
        padding: 0.25rem 1rem;
      }
      button:hover {
        background-color: var(--button-bg-color-hover);
      }
      button:active {
        background-color: var(--button-bg-color);
      }
    `;
  }
  @property({ type: String }) engine = sessionStorage.getItem('engine') ?? 'gpt-4-1106-preview';
  @property({ type: Boolean }) includeContext = JSON.parse(sessionStorage.getItem('include_context')) ?? true;
  @property({ type: String })
  systemMessage = sessionStorage.getItem('system_message') ?? `Your name is ChatGPT. You are a helpful assistant.`;
  render() {
    return html`
      <nav>
        <div>
          <select
            id="engine"
            .value=${this.engine}
            @change=${(e) => {
              this.engine = e.target.value;
              sessionStorage.setItem('engine', this.engine);
              document.querySelector('chat-gpt').engine = this.engine;
            }}>
            <option value="gpt-4-1106-preview">GPT 4 Turbo</option>
            <option value="gpt-4">GPT 4</option>
            <option value="gpt-4-vision-preview">GPT 4 Vision</option>
            <option value="gpt-3.5-turbo">GPT 3.5 Turbo</option>
            <option value="dall-e-3">DALL-E 3</option>
            <option value="dall-e-2">DALL-E 2</option>
            <option value="tts-1">TTS 1</option>
            <option value="vertex">Vertex Code Bison</option>
            <option value="auto">Auto Engine</option>
          </select>

          <input
            type="text"
            placeholder="System Message"
            .value=${this.systemMessage}
            style="width: 300px;"
            @input=${(e) => {
              this.systemMessage = e.target.value;
              sessionStorage.setItem('system_message', this.systemMessage);
            }} />
          <input
            type="checkbox"
            name="include-context"
            .checked=${this.includeContext}
            @change=${(e) => {
              this.includeContext = e.target.checked;
              sessionStorage.setItem('include_context', this.includeContext);
            }} />
          <span>Include History</span>

          <button
            @click=${(e) => {
              store.deleteThread();
            }}>
            Delete Thread
          </button>
        </div>
      </nav>
    `;
  }
}

customElements.define('chat-nav', ChatNav);
