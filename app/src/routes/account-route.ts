import { createContext, provide } from '@lit/context';
import { LitElement, css, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import '../atomics/theme-toggle.js';
import '../components/app-nav.js';
import { ApiService } from '../services/api-service.js';
import { Store } from '../state/store.js';
import buttonsCss from '../styles/buttons.css.js';
import inputCss from '../styles/input.css.js';
@customElement('account-route')
export class AccountRoute extends LitElement {
  static styles = [inputCss, buttonsCss, css``];
  apiService = new ApiService();
  @provide({ context: createContext('chat-store') }) store: Store = new Store(this.apiService);

  saveSk() {
    const sk = this.shadowRoot.querySelector<HTMLInputElement>('input[placeholder="OpenAI API Key"]').value;
    this.store.setOpenAiSk(sk);
  }

  render() {
    return html`
      <theme-toggle> </theme-toggle>
      <app-nav></app-nav>
      <input placeholder="email" />
      <input placeholder="OpenAI API Key" />
      <button @click=${this.saveSk}>Save</button>
    `;
  }
}
