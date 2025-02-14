import type { Store } from '../state/store.js';
import type { IChatHistory } from '../types.js';

import { html, LitElement, nothing } from 'lit';
import { customElement, query, state } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { marked, Renderer, Tokens } from 'marked';
import hljs from './_hljs.js';

import { consume, createContext } from '@lit/context';
import { loadingIcon } from '../atomics/loading-icon.js';
import { githubDarkDimmed } from '../styles/github-dark-dimmed.css.js';

import chatGptStyles from './chat-history.css.js';

const renderer = new Renderer();

renderer.image = function ({ href = '', title = 'image', text = 'image' }: Tokens.Image): string {
  return `
    <div style="display: flex;">
      <img src="${href}" alt="${text}" title="${title}" />
    </div>
  `;
};

renderer.code = function ({ text, lang }: Tokens.Code): string {
  const validLang = !!(lang && hljs.getLanguage(lang));
  const highlighted = validLang ? hljs.highlight(text, { language: lang }).value : text;
  return `
    <div class="button-copy-container">
      <button class="copy" 
        onclick="(function() { 
          const codeBlock = this.parentElement.nextElementSibling.querySelector('code'); 
          const codeText = codeBlock.textContent; 
          navigator.clipboard.writeText(codeText); 
          this.textContent = 'Copied'; 
          setTimeout(() => { this.textContent = 'Copy'; }, 3000); 
        }).call(this)">
        Copy
      </button>
    </div>
    <pre><code class="hljs ${lang}">${highlighted}</code></pre>
  `;
};

marked.use({ renderer });

@customElement('chat-history')
export class ChatHistory extends LitElement {
  static styles = [githubDarkDimmed, chatGptStyles];
  @query('textarea') textareaEl: HTMLTextAreaElement;
  @state() loading = false;
  @state() history: IChatHistory = [];
  @consume({ context: createContext<Store>('chat-store') }) store: Store;
  subscriptions: any = [];

  connectedCallback() {
    super.connectedCallback();
    this.subscriptions.push(
      this.store.subscribe('activeThread', (thread) => {
        this.history = thread.history;
        this.requestUpdate();
      }),
      this.store.subscribe('loading', (loading) => {
        this.loading = loading;
      })
    );
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  deleteItem(index: number) {
    const reversedIndex = this.history.length - index - 1;
    this.store.deleteChatHistoryItem(reversedIndex);
  }

  render() {
    return html`
      <div class="history-outer">
        ${loadingIcon(this.loading)}
        ${[...this.history].reverse().map(
          (item, i) => html`
            <p class="history ${item.role}">
              <button class="delete" @click=${(e) => this.deleteItem(i)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M18 6L6 18"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round" />
                  <path
                    d="M6 6L18 18"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round" />
                </svg>
              </button>
              ${unsafeHTML(marked.parse(item.content) as string)}
              ${item.custom ? unsafeHTML(item.custom as string) : nothing}
            </p>
          `
        )}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'chat-history': ChatHistory;
  }
}
