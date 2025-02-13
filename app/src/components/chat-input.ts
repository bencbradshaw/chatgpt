import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { buttonsCss } from '../styles/buttons.css.js';
const SENDSVG = html`
  <svg viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 27L28 15L2 3L2 13L20 15L2 17L2 27Z" fill="currentColor" />
  </svg>
`;
@customElement('chat-input')
class ChatInput extends LitElement {
  @property({ type: String }) placeholder = 'Type a message...';

  static styles = [
    buttonsCss,
    css`
      :host {
        max-width: 100%;
      }
      .inputs-outer {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 0.5rem 0;
      }
      .inputs-inner {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0.5rem;
        margin: 0 auto;
      }

      textarea {
        background-color: var(--chatbox-bg-color);
        color: white;
        border: none;
        padding: 1rem;
        border-radius: 20px;
        resize: none;
        min-height: 1rem;
        max-height: 1rem;
        overflow: hidden;
        margin: 0 10px;
        min-width: 800px;
        max-width: 800px;
        font-family: 'Arial', sans-serif;
        font-size: 1rem;
        line-height: 1rem;
        background-color: var(--color-primary-300);
        &:disabled {
          cursor: not-allowed;
        }
        &:focus {
          outline: none;
        }
      }
      .buttons {
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        button {
          border-radius: 50%;
          margin: 0;
          background-color: transparent;
          &:hover {
            background-color: var(--color-primary-300);
          }
          svg {
            height: 20px;
            width: 20px;
            padding-left: 2px;
            padding-top: 2px;
          }
        }
      }
    `
  ];
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
              ${SENDSVG}
            </button>
          </div>
        </div>
      </div>
    `;
  }
}
