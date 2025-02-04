import { createContext, provide } from '@lit/context';
import { LitElement, html } from 'lit';
import { Store } from '../state/store.js';
import { customElement } from 'lit/decorators.js';

@customElement('chat-provider')
class ChatProvider extends LitElement {
  @provide({ context: createContext('chat-store') }) store: Store = new Store();
  render() {
    return html`<slot></slot>`;
  }
}
