import { LitElement, css, html } from 'lit';
import { customElement, query, state } from 'lit/decorators.js';
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
      }
    `
  ];

  apiService = new ApiService();
  store: Store = new Store(this.apiService);

  @state() systemMessages: SystemMessage[] = [];
  @state() activelyEditingSystemMessage: SystemMessage;
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
  }

  render() {
    return html`
      <theme-toggle> </theme-toggle>
      <app-nav></app-nav>
      ${this.activelyEditingSystemMessage
        ? html` <textarea placeholder="System Message" .value=${this.activelyEditingSystemMessage.text}></textarea> `
        : html` <textarea placeholder="System Message"></textarea> `}
      <button @click=${this.saveSystemMessage}>Add</button>
      <ul>
        ${this.systemMessages.map(
          (message) =>
            html`<li
              @click=${() => {
                this.activelyEditingSystemMessage = message;
              }}>
              ${message.text}
            </li>`
        )}
      </ul>
    `;
  }
}
