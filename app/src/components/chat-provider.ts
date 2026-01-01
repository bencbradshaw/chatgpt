import { createContext, provide } from '@lit/context';
import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { ApiService } from '../services/api-service.js';
import { Store } from '../state/store.js';

@customElement('chat-provider')
class ChatProvider extends LitElement {
  apiService = new ApiService();
  @provide({ context: createContext('chat-store') }) store: Store = new Store(this.apiService);

  connectedCallback(): void {
    super.connectedCallback();

    this.store.ready
      .then(async () => {
        const rawId = window.router.activeRoute?.params?.id;
        const parsed = rawId ? Number(rawId) : NaN;
        const threadId: IDBValidKey = Number.isFinite(parsed) ? parsed : 0;

        if (!rawId) {
          window.router.navigate(`/app/chat/${threadId}`);
        }

        await this.store.selectThread(threadId);
      })
      .catch((error) => {
        console.error('Chat provider init failed:', error);
      });
  }
  #handleSubmitPrompt({ detail: { text } }: CustomEvent<{ text: string }>) {
    this.store.submitChat(text);
  }

  render() {
    return html`<slot @submit-prompt=${this.#handleSubmitPrompt}></slot>`;
  }
}
