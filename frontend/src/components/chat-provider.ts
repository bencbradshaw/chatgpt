import { createContext, provide } from '@lit/context';
import { LitElement, html } from 'lit';
import { Store } from '../state/store.js';
import { customElement } from 'lit/decorators.js';
import { ApiService } from '../services/api-service.js';

@customElement('chat-provider')
class ChatProvider extends LitElement {
  apiService = new ApiService();
  @provide({ context: createContext('chat-store') }) store: Store = new Store(this.apiService);
  render() {
    return html`<slot></slot>`;
  }
}
