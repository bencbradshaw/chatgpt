import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('chat-input')
class ChatInput extends LitElement {
  @property({ type: String }) placeholder = 'Type a message...';

  static styles = css`
    .inputs-outer {
      width: 100vw;
      max-width: 100vw;
      height: 20vh;
      max-height: 20vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    .inputs-inner {
      display: flex;
      align-items: flex-end;
      justify-content: center;
      padding: 0.5rem;
    }

    textarea {
      background-color: var(--chatbox-bg-color);
      color: white;
      border: 1px solid #474747; /* a slightly contrasting border color */
      padding: 1rem;
      border-radius: 5px;
      min-height: calc(4rem + 12px);
      max-height: 100%;
      margin: 0 10px;
      min-width: 400px;
      max-width: 800px;
      font-family: 'Arial', sans-serif;
      font-size: 1rem;
    }
    textarea:disabled {
      cursor: not-allowed;
    }
    .buttons {
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
    }
  `;
  #emitSubmitPrompt(text: string) {
    this.dispatchEvent(new CustomEvent('submit-prompt', { detail: { text }, bubbles: true }));
  }
  render() {
    return html`
      <div class="inputs-outer">
        <div class="inputs-inner">
          <textarea
            title="Enter to send. Shift+Enter for new line."
            @keydown=${(e) => {
              if (e.key === 'Enter' && e.shiftKey) return;
              if (e.key === 'Enter') {
                e.preventDefault();
                this.#emitSubmitPrompt(e.target.value);
                e.target.value = '';
                return;
              }
            }}></textarea>
          <div class="buttons">
            <button
              @click=${(e) => {
                const textarea = this.shadowRoot.querySelector('textarea');
                this.#emitSubmitPrompt(textarea.value);
                textarea.value = '';
              }}>
              Send
            </button>
          </div>
        </div>
      </div>
    `;
  }
}
