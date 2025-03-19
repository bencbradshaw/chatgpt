import { consume, createContext } from '@lit/context';
import { LitElement, css, html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
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

@customElement('chat-options')
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

        select,
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
            justify-content: flex-end;
          }
        }

        &::backdrop {
          background-color: rgba(0, 0, 0, 0.5);
        }
      }
    `
  ];

  @property({ type: String })
  engine = sessionStorage.getItem('engine') ?? 'gpt-4o-mini';

  @property({ type: Boolean })
  includeContext = JSON.parse(sessionStorage.getItem('include_context')) ?? true;

  @property({ type: String })
  systemMessage = sessionStorage.getItem('system_message') ?? `Your name is ChatGPT. You are a helpful assistant.`;

  @state() thread: Thread;
  @state() stagedSystemMessage: SystemMessage;

  private sub1: { unsubscribe: () => void };

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

  get #engineOptionsTemplate() {
    const engines = [
      { value: 'gpt-4o-mini', label: '4o mini' },
      { value: 'gpt-4o', label: '4o' },
      { value: 'o3-mini', label: 'o3 mini' },
      { value: 'llama-3.3-70b', label: 'Llama 3.3 70B' },
      { value: 'llama-3.2-3b', label: 'Llama 3.2 3B' },
      { value: 'dolphin-2.9.2-qwen2-72b', label: 'Dolphin 2.9.2 Qwen2 72B' },
      { value: 'llama-3.1-405b', label: 'Llama 3.1 405B' },
      { value: 'qwen2.5-coder-32b', label: 'Qwen 2.5 Coder 32B' },
      { value: 'deepseek-r1-671b', label: 'Deepseek R1 671B' },
      { value: 'deepseek-r1-llama-70b', label: 'Deepseek R1 Llama 70B' },
      { value: 'qwen-2.5-vl', label: 'Qwen 2.5 VL' }
    ];

    return engines.map(({ value, label }) => html`<option value="${value}">${label}</option>`);
  }

  handleEngineChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.store.updateThread({ selected_engine: select.value as any });
  }

  handleSystemMessageInput(event: Event) {
    const textarea = event.target as HTMLTextAreaElement;
    this.store.updateThread({ system_message: textarea.value });
  }

  handleTextareaKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      const floatingMenu = this.shadowRoot.querySelector('floating-menu') as FloatingMenu;
      floatingMenu.close();
    }
  }

  renderSystemMessages() {
    return this.store.systemMessages.map(
      (message) => html`
        <p
          class=${this.stagedSystemMessage === message ? 'active' : ''}
          @click=${() => this.selectStagedSystemMessage(message)}>
          ${message.text}
        </p>
      `
    );
  }

  selectStagedSystemMessage(message: SystemMessage) {
    this.stagedSystemMessage = message;
  }

  closeDialog() {
    this.shadowRoot.querySelector('dialog').close();
  }

  selectSystemMessage() {
    this.store.updateThread({ system_message: this.stagedSystemMessage.text });
    this.closeDialog();
    this.stagedSystemMessage = null;
  }
  render() {
    if (!this.thread) return nothing;

    return html`
      <floating-menu position="top">
        <button slot="invoker">${threeDotSvg}</button>
        <div>
          <select id="engine" .value=${this.thread.selected_engine} @change=${this.handleEngineChange}>
            ${this.#engineOptionsTemplate}
          </select>

          <textarea
            placeholder="System Message"
            .value=${this.thread.system_message}
            style="width: 300px;"
            @input=${this.handleSystemMessageInput}
            @keydown=${this.handleTextareaKeydown}></textarea>

          <button @click=${() => this.shadowRoot.querySelector('dialog').showModal()}>${threeDotSvg}</button>
        </div>
      </floating-menu>

      <dialog>
        <div class="wrapper">
          <div class="scrollable">${this.renderSystemMessages()}</div>
          <div class="buttons">
            <button @click=${this.closeDialog}>Cancel</button>
            <button @click=${this.selectSystemMessage}>Select</button>
          </div>
        </div>
      </dialog>
    `;
  }
}
