import type { IChatHistory, Engine, Thread } from '../types.js';
import type { Store } from '../state/store.js';

import { html, LitElement, nothing } from 'lit';
import { customElement, query, state } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { marked, Renderer, Tokens } from 'marked';
import hljs from './_hljs.js';

import { githubDarkDimmed } from '../styles/github-dark-dimmed.css.js';
import { loadingIcon } from '../atomics/loading-icon.js';
import { consume, createContext } from '@lit/context';

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
      this.store.subscribe<Thread>('activeThread', (thread) => {
        this.history = thread.history;
        this.requestUpdate();
      }),
      this.store.subscribe<boolean>('loading', (loading) => {
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
              <button class="delete" @click=${(e) => this.deleteItem(i)}>x</button>
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
