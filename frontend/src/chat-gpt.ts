import hljs from 'highlight.js';
import { css, html, LitElement, nothing } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { marked } from 'marked';
import { ChatNav } from './chat-nav.js';
import { githubDarkDimmed } from './github-dark-dimmed.css.js';

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
      align-items: flex-start;
      justify-content: flex-start;
      height: calc(80vh - 25px);
      max-height: calc(80vh - 25px);
      overflow-y: auto;
      max-width: 100%;
    }
    .history {
      width: 800px;
      max-width: 800px;
      padding: 1rem;
      box-shadow: rgb(255 255 255) 0px 0px 14px 0px;
      background-color: #323131;
    }

    .history.user {
      width: auto;
      margin: 1rem 10% 1rem auto;
      border-radius: 10px 10px 0 10px;
    }

    .history.assistant {
      align-self: flex-start;
      margin: 1rem 30% 1rem auto;
      border-radius: 10px 10px 10px 0;
    }
    img {
      max-width: 100%;
      max-height: 500px;
      margin: 0 auto;
    }
    @media (max-width: 1000px) {
      .history {
        width: auto;
        max-width: 100%;
        margin: 0.5rem;
      }

      .history.user {
        align-self: flex-end;
      }

      .history.assistant {
        align-self: flex-start;
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
    }

    textarea {
      min-height: calc(1rem + 12px);
      width: 400px;
      min-width: 400px;
      height: 50px;
      max-height: 20vh;
      margin: 0 10px;
      padding: 6px 10px;
      max-width: 80vw;
    }
    button {
      margin: 0 10px;
    }
  `;
  @state() loading = false;
  @state() history: {
    role: 'user' | 'assistant';
    content: string;
  }[] = [];

  async updated() {
    const codeEls = this.shadowRoot.querySelectorAll<HTMLElement>('code:not([data-highlighted])');
    codeEls.forEach((block: HTMLElement) => {
      hljs.highlightElement(block);
    });
  }

  async submit() {
    const engine = document.querySelector<ChatNav>('chat-nav').engine;
    if (!engine.includes('dall-e')) {
      await this.runChatReq();
    }
    if (engine.includes('dall-e')) {
      await this.runImageReq();
    }
  }

  async runChatReq() {
    this.loading = true;
    const engine = document.querySelector<ChatNav>('chat-nav').engine;
    const element = this.shadowRoot?.querySelector('textarea');
    const prompt = element.value;
    const includeContext = document.querySelector<ChatNav>('chat-nav').includeContext;
    element.value = '';
    this.history = [
      ...this.history,
      {
        role: 'user',
        content: prompt
      }
    ];
    const resp = await fetch('http://localhost:8080', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // prettier-ignore
        'accept': 'text/event-stream'
      },
      body: JSON.stringify({
        ...(includeContext
          ? {
              messages: [
                {
                  role: 'system',
                  content: document.querySelector<ChatNav>('chat-nav').systemMessage
                },
                ...this.history.map((item) => {
                  return {
                    role: item.role,
                    content: item.content
                  };
                })
              ]
            }
          : {
              messages: [
                {
                  role: 'system',
                  content: document.querySelector<ChatNav>('chat-nav').systemMessage
                },
                {
                  role: 'user',
                  content: prompt
                }
              ]
            }),
        engine: engine
      })
    });
    const reader = resp.body.getReader();
    let message = '';
    const nextIndex = this.history.length;
    this.history[nextIndex] = {
      role: 'assistant',
      content: ''
    };
    while (true) {
      this.loading = false;
      const { done, value } = await reader.read();
      if (done) break;
      message = new TextDecoder().decode(value);
      this.history[nextIndex].content += message;
      this.history = [...this.history];
    }
  }
  async runImageReq() {
    this.loading = true;
    const engine = document.querySelector<ChatNav>('chat-nav').engine;
    const element = this.shadowRoot?.querySelector('textarea');
    const prompt = element.value;
    element.value = '';
    this.history = [
      ...this.history,
      {
        role: 'user',
        content: prompt
      }
    ];
    const resp = await fetch('http://localhost:8080/image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: engine,
        prompt: prompt,
        n: 1,
        size: '1024x1024'
      })
    });
    const imgResp = (await resp.json()) as { url: string };
    const nextIndex = this.history.length;
    this.history[nextIndex] = {
      role: 'assistant',
      // prettier-ignore
      content: `
![image](${imgResp.url})
`
    };
    this.history = [...this.history];
    this.loading = false;
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
          const localContent = unsafeHTML(marked.parse(item.content));

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
