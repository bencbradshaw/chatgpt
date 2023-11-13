import DOMPurify from 'dompurify';
import hljs from 'highlight.js';
import { css, html, LitElement } from 'lit';
import { customElement, query, state } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { marked } from 'marked';
import { chatGptStyles } from './chat-gpt.css.js';
import { ChatNav } from './chat-nav.js';
import { githubDarkDimmed } from './github-dark-dimmed.css.js';
import { loadingIcon } from './loading-icon.js';
const renderer = {
  image(href = '', title = 'image', text = 'image') {
    return `
      <div style="display: flex;">
        <img src="${href}" alt="${text}" title="${title}" />
      </div>
    `;
  }
};
marked.use({ renderer });
@customElement('chat-gpt')
export class ChatGPT extends LitElement {
  static styles = css`
    ${githubDarkDimmed}
    ${chatGptStyles}
  `;
  @query('textarea') textareaEl: HTMLTextAreaElement;
  @state() loading = false;
  @state() history: {
    role: 'user' | 'assistant';
    content: string;
  }[] = sessionStorage.getItem('history') ? JSON.parse(sessionStorage.getItem('history')) : [];

  async updated() {
    const codeEls = this.shadowRoot.querySelectorAll<HTMLElement>('code:not([data-highlighted])');
    codeEls.forEach((block: HTMLElement) => {
      hljs.highlightElement(block);
    });
  }

  async performPostRequest(endpoint: string, body: any): Promise<any> {
    this.loading = true;
    let headers = {};
    if (body instanceof FormData) {
      headers = {
        Accept: 'application/json',
        'Content-Type': 'multipart/form-data'
      };
    } else {
      headers = {
        'Content-Type': 'application/json',
        Accept: endpoint === '/' ? 'text/event-stream' : 'application/json'
      };
    }
    const response = await fetch(`http://localhost:8080${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });
    this.loading = false;
    return response;
  }

  async submit(e: Event) {
    const engine = document.querySelector<ChatNav>('chat-nav').engine;
    switch (engine) {
      case 'gpt-4-1106-preview':
      case 'gpt-4':
      case 'gpt-3.5-turbo':
        await this.runChatReq();
        break;
      case 'dall-e-2':
      case 'dall-e-3':
        await this.runImageReq();
        break;
      case 'gpt-4-vision-preview':
        await this.runVisionReq();
        break;
      default:
        console.log('invalid engine');
        break;
    }
  }

  async runChatReq() {
    const engine = document.querySelector<ChatNav>('chat-nav').engine;
    const element = this.textareaEl;
    const prompt = element.value;
    const includeContext = document.querySelector<ChatNav>('chat-nav').includeContext;
    element.value = '';
    this.addToHistory('user', prompt);

    const reqBody = {
      ...(includeContext
        ? {
            messages: [
              { role: 'system', content: document.querySelector<ChatNav>('chat-nav').systemMessage },
              ...this.history.map((item) => ({ role: item.role, content: item.content }))
            ]
          }
        : {
            messages: [
              { role: 'system', content: document.querySelector<ChatNav>('chat-nav').systemMessage },
              { role: 'user', content: prompt }
            ]
          }),
      engine: engine
    };

    const response = await this.performPostRequest('/', reqBody);
    const reader = response.body.getReader();
    let message = '';
    const nextIndex = this.history.length;
    this.addToHistory('assistant', '');

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      message = new TextDecoder().decode(value);
      this.updateAssistantResponse(nextIndex, message);
    }
    this.writeToSessionStorage();
  }

  async runVisionReq() {
    const element = this.textareaEl;
    const prompt = element.value;
    element.value = '';
    // make a form submit to /vision
    const form = new FormData();
    const file = this.shadowRoot.querySelector<HTMLInputElement>('input[type=file]').files[0];
    form.append('file', new Blob([file], { type: file.type }));
    const response = await this.performPostRequest('/vision', form);
  }

  writeToSessionStorage() {
    try {
      sessionStorage.setItem('history', JSON.stringify(this.history));
    } catch (err) {
      console.log('error writing to session storage. probably full. clear history and try again', err);
    }
  }

  async runImageReq() {
    const engine = document.querySelector<ChatNav>('chat-nav').engine;
    const element = this.textareaEl;
    const prompt = element.value;
    element.value = '';
    this.addToHistory('user', prompt);

    const requestBody = {
      model: engine,
      prompt: prompt,
      n: 1,
      size: '1024x1024'
    };

    const response = await this.performPostRequest('/image', requestBody);
    const imgResp = (await response.json()) as { url: string };
    const imgMarkdown = `![image](${imgResp.url})`;
    this.addToHistory('assistant', imgMarkdown);
  }

  addToHistory(role: 'user' | 'assistant', content: string) {
    this.history = [...this.history, { role, content }];
    this.writeToSessionStorage();
  }

  updateAssistantResponse(index: number, newContent: string) {
    if (this.history[index]) {
      this.history[index].content += newContent;
      this.history = [...this.history];
    }
  }

  render() {
    return html`
      <div class="history-outer">
        ${loadingIcon(this.loading)}
        ${[...this.history].reverse().map((item) => {
          const localContent = unsafeHTML(marked.parse(DOMPurify.sanitize(item.content)));

          return html` <p class="history ${item.role}">${localContent}</p> `;
        })}
      </div>
      <div class="inputs-outer">
        <div class="inputs-inner">
          <input
            type="file"
            accept="image/*"
            style="display: none"
            @change=${(e: Event & { target: HTMLInputElement }) => {
              console.log('e', e.target.files);
            }} />
          <button
            @click=${() => {
              const input = this.shadowRoot.querySelector('input');
              input.click();
            }}>
            Upload Image
          </button>
          <textarea
            @keydown=${(e) => {
              if (e.key === 'Enter' && e.shiftKey) return;

              if (e.key === 'Enter') {
                e.preventDefault();
                this.submit(e);
                return;
              }
            }}></textarea>
          <button @click=${this.submit}>Send</button>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'chat-gpt': ChatGPT;
  }
}
