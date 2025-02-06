import { createContext, provide } from '@lit/context';
import { LitElement, html } from 'lit';
import { Store } from '../state/store.js';
import { customElement } from 'lit/decorators.js';
import { ApiService } from '../services/api-service.js';

@customElement('chat-provider')
class ChatProvider extends LitElement {
  apiService = new ApiService();
  @provide({ context: createContext('chat-store') }) store: Store = new Store(this.apiService);

  #handleSubmitPrompt({ detail: { text } }: CustomEvent<{ text: string }>) {
    this.store.submitChat(text);
  }

  render() {
    return html`<slot @submit-prompt=${this.#handleSubmitPrompt}></slot>`;
  }
}
