import { consume, createContext } from '@lit/context';
import { LitElement, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { Store } from '../state/store.js';
import { buttonsCss } from '../styles/buttons.css.js';
import pillCss from '../styles/pill.css.js';
import { textareaCss } from '../styles/textarea.css.js';
import { IFile } from '../types.js';

const SENDSVG = html`
  <svg viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 27L28 15L2 3L2 13L20 15L2 17L2 27Z" fill="currentColor" />
  </svg>
`;

@customElement('chat-input')
class ChatInput extends LitElement {
  @property({ type: String }) placeholder = 'Type a message...';
  @state() stagedFiles: IFile[] = [];
  @consume({ context: createContext<Store>('chat-store') }) store: Store;
  subscriptions: any = [];
  static styles = [
    buttonsCss,
    textareaCss,
    pillCss,
    css`
      :host {
        max-width: 100%;
      }
      textarea {
        min-width: 800px;
        max-width: 800px;
      }
      .inputs-outer {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 0.5rem 0;
        .files {
          display: flex;
          flex-direction: row;
          flex-wrap: wrap;
          justify-content: flex-end;
          align-items: flex-start;
          max-height: 5rem;
          overflow-y: auto;
          width: 830px;
          margin: 0 auto;
        }
      }
      .inputs-inner {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0.5rem;
        margin: 0 auto;
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
  connectedCallback(): void {
    super.connectedCallback();
    this.store.subscribe('stagedFiles', (stagedFiles) => {
      this.stagedFiles = stagedFiles;
    });
  }
  #autoGrowTextArea(textarea: HTMLTextAreaElement) {
    textarea.style.height = 'auto'; // Reset height
    textarea.style.height = `${textarea.scrollHeight}px`; // Set to scroll height
  }
  #emitSubmitPrompt(text: string) {
    this.dispatchEvent(new CustomEvent('submit-prompt', { detail: { text }, bubbles: true }));
  }
  render() {
    return html`
      <div class="inputs-outer">
        <div class="files">
          ${this.stagedFiles.length
            ? this.stagedFiles.map((one) => {
                return html` <span class="pill">${one.name}</span> `;
              })
            : ''}
        </div>
        <div class="inputs-inner">
          <chat-options></chat-options>
          <textarea
            title="Enter to send. Shift+Enter for new line."
            @input=${(e: Event) => this.#autoGrowTextArea(e.target as HTMLTextAreaElement)}
            @keydown=${(e) => {
              if (e.key === 'Enter' && e.shiftKey) return;
              if (e.key === 'Enter') {
                e.preventDefault();
                this.#emitSubmitPrompt((e.target as HTMLTextAreaElement).value);
                (e.target as HTMLTextAreaElement).value = '';
                const textarea = e.target as HTMLTextAreaElement;
                this.#autoGrowTextArea(textarea); // Reset height after submit
                return;
              }
            }}></textarea>
          <div class="buttons">
            <button
              @click=${(e) => {
                const textarea = this.shadowRoot.querySelector('textarea');
                this.#emitSubmitPrompt(textarea.value);
                textarea.value = '';
                this.#autoGrowTextArea(textarea); // Reset height after submit
              }}>
              ${SENDSVG}
            </button>
          </div>
        </div>
      </div>
    `;
  }
}
