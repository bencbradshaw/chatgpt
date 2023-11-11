import DOMPurify from 'dompurify';
import hljs from 'highlight.js';
import styles from 'highlight.js/styles/github-dark-dimmed.css?inline';
import { css, html, LitElement, unsafeCSS } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { marked } from 'marked';
import { ChatNav } from './chat-nav.js';

@customElement('chat-gpt')
export class ChatGPT extends LitElement {
  static styles = css`
    ${unsafeCSS(DOMPurify.sanitize(styles))}
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
      text-align: right;
      margin: 1rem 10% 1rem auto;
      border-radius: 10px 10px 0 10px;
    }
    .history.user code {
      text-align: left;
    }
    .history.assistant {
      align-self: flex-start;
      margin: 1rem 30% 1rem auto;
      border-radius: 10px 10px 10px 0;
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
    const element = this.shadowRoot?.querySelector('textarea');
    const prompt = element.value;
    const engine = document.querySelector<ChatNav>('chat-nav').engine;
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
        prompt: prompt,
        engine: engine,
        systemMessage: 'you are a helpful assistant that answers without telling too much backstory'
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
      const { done, value } = await reader.read();
      if (done) break;
      message = new TextDecoder().decode(value);
      this.history[nextIndex].content += message;
      this.history = [...this.history];
    }
  }

  render() {
    return html`
      <div class="history-outer">
        ${[...this.history].reverse().map((item) => {
          const localContent = unsafeHTML(DOMPurify.sanitize(marked.parse(item.content)));

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
