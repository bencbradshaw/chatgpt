import { LitElement, css, html } from 'lit';
import { customElement, query, state } from 'lit/decorators.js';
import '../atomics/page-layout.js';
import '../atomics/theme-toggle.js';
import '../components/app-nav.js';
import { ApiService } from '../services/api-service.js';
import { Store } from '../state/store.js';
import buttonsCss from '../styles/buttons.css.js';
import inputCss from '../styles/input.css.js';
import typography from '../styles/typography.js';
import { SystemMessage } from '../types.js';

@customElement('system-messages')
export class SystemMessages extends LitElement {
  static styles = [
    inputCss,
    buttonsCss,
    typography,
    css`
      :host {
        display: flex;
        flex-direction: column;
        width: 100vw;
        height: 100vh;
        box-sizing: border-box;
        padding: 0 0.5rem;
      }

      .container {
        max-width: 960px;
        width: 100%;
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        height: 100vh;
      }

      .header {
        margin: 0 0 0 190px;
        padding-bottom: 0.5rem;
        display: flex;
        & > * {
          margin-right: 0.5rem;
        }
      }

      .editor-section {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        margin-bottom: 0.75rem;
        background-color: var(--background-secondary);
        padding: 0.75rem;
        border-radius: 6px;
      }

      .editor-actions {
        display: flex;
        gap: 0.5rem;
        justify-content: flex-end;
      }

      textarea {
        min-height: 80px;
        padding: 0.5rem;
        border-radius: 4px;
        font-family: inherit;
        resize: vertical;
      }

      .messages-section {
        flex: 1;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        overflow-y: auto;
      }

      .messages-list {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
      }

      .message-item {
        padding: 0.5rem 0.75rem;
        background-color: var(--chatbox-bg-color);
        border-radius: 4px;
        cursor: pointer;
        transition: transform 0.2s, background-color 0.2s;
        position: relative;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .message-item:hover {
        background-color: var(--button-bg-color-hover);
        transform: translateY(-1px);
      }

      .message-item.active {
        background-color: var(--color-accent-100);
        color: var(--primary-font-color);
      }

      button.secondary {
        background-color: var(--button-bg-color);
        color: var(--primary-font-color);
      }

      h1 {
        margin-top: 0;
        margin-bottom: 0.5rem;
      }

      h2 {
        margin-top: 0;
        margin-bottom: 0.5rem;
        font-size: 1.1rem;
      }

      .messages-section h2 {
        margin-bottom: 0.5rem;
      }

      .empty-state {
        text-align: center;
        padding: 1rem;
        color: var(--text-secondary);
      }
    `
  ];

  apiService = new ApiService();
  store: Store = new Store(this.apiService);

  @state() systemMessages: SystemMessage[] = [];
  @state() activelyEditingSystemMessage: SystemMessage | null = null;
  @query('textarea') textarea!: HTMLTextAreaElement;
  #sub;

  connectedCallback(): void {
    super.connectedCallback();
    this.#sub = this.store.subscribe('systemMessages', (messages) => {
      this.systemMessages = messages;
    });
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.#sub.unsubscribe();
  }

  saveSystemMessage() {
    if (this.activelyEditingSystemMessage) {
      this.store.updateSystemMessage({
        ...this.activelyEditingSystemMessage,
        text: this.textarea.value
      });
    } else {
      this.store.saveSystemMessage(this.textarea.value);
    }
    this.resetEditor();
  }

  resetEditor() {
    this.activelyEditingSystemMessage = null;
    this.textarea.value = '';
  }

  deleteSystemMessage() {
    if (this.activelyEditingSystemMessage) {
      this.store.deleteSystemMessage(this.activelyEditingSystemMessage.id);
      this.resetEditor();
    }
  }

  render() {
    return html`
      <page-layout>
        <div slot="header" class="header">
          <app-nav></app-nav>
          <theme-toggle></theme-toggle>
        </div>
        <div class="container">
          <div class="editor-section">
            <h2>${this.activelyEditingSystemMessage ? 'Edit System Message' : 'Create New System Message'}</h2>
            <textarea
              placeholder="Enter system message here..."
              .value=${this.activelyEditingSystemMessage ? this.activelyEditingSystemMessage.text : ''}></textarea>
            <div class="editor-actions">
              ${this.activelyEditingSystemMessage
                ? html`<button class="secondary" @click=${this.resetEditor}>Cancel</button>
                    <button class="secondary" @click=${this.deleteSystemMessage}>Delete</button>`
                : ''}
              <button @click=${this.saveSystemMessage}>
                ${this.activelyEditingSystemMessage ? 'Update' : 'Add'} Message
              </button>
            </div>
          </div>

          <div class="messages-section">
            <h2>Your System Messages</h2>
            ${this.systemMessages.length > 0
              ? html`
                  <ul class="messages-list">
                    ${this.systemMessages.map(
                      (message) => html`
                        <li
                          class="message-item ${this.activelyEditingSystemMessage?.id === message.id ? 'active' : ''}"
                          @click=${() => {
                            this.activelyEditingSystemMessage = message;
                          }}>
                          ${message.text}
                        </li>
                      `
                    )}
                  </ul>
                `
              : html`<div class="empty-state">No system messages yet. Create one above!</div>`}
          </div>
        </div>
      </page-layout>
    `;
  }
}
