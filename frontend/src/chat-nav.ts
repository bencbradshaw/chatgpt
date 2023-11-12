import { css, html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';

export class ChatNav extends LitElement {
  static get styles() {
    return css`
      /* Your styles here */
      :host {
        height: 25px;
      }
    `;
  }
  @property({ type: String }) engine = 'gpt-4-1106-preview';
  @property({ type: Boolean }) includeContext = false;
  @property({ type: String }) systemMessage = 'Your name is ChatGPT.';
  render() {
    return html`
      <nav>
        <div>
          <select
            id="engine"
            @change=${(e) => {
              this.engine = e.target.value;
            }}>
            <option value="gpt-4-1106-preview" selected>GPT 4 Turbo</option>
            <option value="gpt-4">GPT 4</option>
            <option value="gpt-4-vision-preview">GPT 4 Vision</option>
            <option value="gpt-3.5-turbo">GPT 3.5 Turbo</option>
            <option value="dall-e-3">DALL-E 3</option>
            <option value="dall-e-2">DALL-E 2</option>
          </select>

          <input
            type="text"
            placeholder="System Message"
            .value=${this.systemMessage}
            style="width: 300px;"
            @input=${(e) => {
              this.systemMessage = e.target.value;
            }} />
          <span>Include History</span>
          <input
            type="checkbox"
            name="include-context"
            @change=${(e) => {
              this.includeContext = e.target.checked;
            }} />
        </div>
      </nav>
    `;
  }
}

customElements.define('chat-nav', ChatNav);
