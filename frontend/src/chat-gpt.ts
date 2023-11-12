import hljs from 'highlight.js';
import DOMPurify from 'dompurify';
import { css, html, LitElement, nothing } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { marked } from 'marked';
import { ChatNav } from './chat-nav.js';
import { githubDarkDimmed } from './github-dark-dimmed.css.js';
const renderer = {
  image(href, title, text) {
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
    :host {
      display: flex;
      flex-direction: column;
      height: calc(100vh - 25px);
    }
    :host > * {
      box-sizing: border-box;
    }
    .history-outer {
      display: flex;
      flex-direction: column-reverse;
      align-items: center;
      justify-content: flex-start;
      height: calc(80vh - 25px);
      max-height: calc(80vh - 25px);
      overflow-y: auto;
      max-width: 100%;
      padding: 0 5%;
    }
    .history {
      width: 800px;
      min-width: 800px;
      max-width: 800px;
      padding: 1rem 2rem;
      box-shadow: rgb(255 255 255) 0px 0px 14px 0px;
      background-color: #323131;
    }
    .history.user {
      margin-left: 2rem;
      border-radius: 16px 16px 0 16px;
    }
    .history.assistant {
      border-radius: 16px 16px 16px 0;
      margin-right: 2rem;
    }
    img {
      max-width: 100%;
      max-height: 500px;
      margin: 0 auto;
    }
    @media (max-width: 1000px) {
      .history-outer {
        padding: 0 1rem;
      }
      .history {
        width: auto;
        min-width: auto;
        max-width: 100%;
        margin: 0.5rem;
      }
    }
    .inputs-outer {
      width: 100vw;
      max-width: 100vw;
      height: 20vh;
      max-height: 20vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    .inputs-inner {
      display: flex;
      align-items: flex-end;
      justify-content: center;
      padding: 0.5rem;
    }

    textarea {
      min-height: calc(4rem + 12px);
      max-height: calc(20vh - 2rem);
      margin: 0 10px;
      padding: 6px 10px;
      min-width: 800px;
      max-width: 800px;
    }
    button {
      margin: 0 10px;
      cursor: pointer;
    }
  `;
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
    const response = await fetch(`http://localhost:8080${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json', // TODO update to allow form data for image upload
        Accept: endpoint === '/' ? 'text/event-stream' : 'application/json'
      },
      body: JSON.stringify(body)
    });
    this.loading = false;
    return response;
  }

  async submit() {
    const engine = document.querySelector<ChatNav>('chat-nav').engine;
    if (!engine.includes('dall-e')) {
      await this.runChatReq();
    } else if (engine.includes('dall-e')) {
      await this.runImageReq();
    } else if (engine.includes('gpt-4-vision-preview')) {
      await this.runVisionReq();
    } else {
      console.log('invalid engine');
    }
  }

  async runChatReq() {
    const engine = document.querySelector<ChatNav>('chat-nav').engine;
    const element = this.shadowRoot.querySelector('textarea');
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
    const engine = document.querySelector<ChatNav>('chat-nav').engine;
    const element = this.shadowRoot.querySelector('textarea');
    const prompt = element.value;
    element.value = '';
    // make a form submit to /vision
    const form = new FormData();
    form.append('prompt', prompt);
    form.append('engine', engine);
    const response = await this.performPostRequest('http://localhost:8080/vision', form);
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
    const element = this.shadowRoot.querySelector('textarea');
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

  get loadingIcon() {
    if (!this.loading) return nothing;
    return html`
      <div style="min-height: 100px; min-width: 100px">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          xmlns:xlink="http://www.w3.org/1999/xlink"
          style="margin: 0 auto; display:block;"
          width="100px"
          height="100px"
          viewBox="0 0 100 100"
          preserveAspectRatio="xMidYMid">
          <circle cx="50" cy="50" r="0" fill="none" stroke="#e90c59" stroke-width="2">
            <animate
              attributeName="r"
              repeatCount="indefinite"
              dur="1s"
              values="0;40"
              keyTimes="0;1"
              keySplines="0 0.2 0.8 1"
              calcMode="spline"
              begin="0s"></animate>
            <animate
              attributeName="opacity"
              repeatCount="indefinite"
              dur="1s"
              values="1;0"
              keyTimes="0;1"
              keySplines="0.2 0 0.8 1"
              calcMode="spline"
              begin="0s"></animate>
          </circle>
          <circle cx="50" cy="50" r="0" fill="none" stroke="#46dff0" stroke-width="2">
            <animate
              attributeName="r"
              repeatCount="indefinite"
              dur="1s"
              values="0;40"
              keyTimes="0;1"
              keySplines="0 0.2 0.8 1"
              calcMode="spline"
              begin="-0.5s"></animate>
            <animate
              attributeName="opacity"
              repeatCount="indefinite"
              dur="1s"
              values="1;0"
              keyTimes="0;1"
              keySplines="0.2 0 0.8 1"
              calcMode="spline"
              begin="-0.5s"></animate>
          </circle>
        </svg>
      </div>
    `;
  }

  render() {
    return html`
      <div class="history-outer">
        ${this.loadingIcon}
        ${[...this.history].reverse().map((item) => {
          const localContent = unsafeHTML(marked.parse(DOMPurify.sanitize(item.content)));

          return html` <p class="history ${item.role}">${localContent}</p> `;
        })}
      </div>
      <div class="inputs-outer">
        <div class="inputs-inner">
          <textarea
            @keydown=${(e) => {
              if (e.key === 'Enter' && e.shiftKey) return;
              if (e.key === 'Enter') {
                e.preventDefault();
                this.submit();
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
