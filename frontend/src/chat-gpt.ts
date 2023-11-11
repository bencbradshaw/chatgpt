import DOMPurify from 'dompurify';
import { css, html, LitElement } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { marked } from 'marked';

@customElement('chat-gpt')
export class ChatGPT extends LitElement {
  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      height: 100vh;
    }
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    .history-outer {
      display: flex;
      flex-direction: column-reverse;
      align-items: flex-start;
      justify-content: flex-start;
      height: 80vh;
      max-height: 80vh;
      overflow-y: auto;
    }
    .history {
      width: 800px;
      max-width: 800px;
      margin: 0 auto;
    }
    .history.user {
      align-self: flex-end;
    }
    .history.openai {
      align-self: flex-start;
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
      width: 400px;
      max-width: 400px;
      height: 50px;
      max-height: 20vh;
      margin: 0 10px;
      padding: 6px 10px;
    }
    button {
      margin: 0 10px;
    }
  `;

  @state() history: {
    role: 'user' | 'openai';
    content: string;
  }[] = [];

  async submit() {
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
    const resp = await fetch('http://localhost:8080', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // prettier-ignore
        'accept': 'text/event-stream'
      },
      body: JSON.stringify({ prompt: prompt })
    });
    const reader = resp.body.getReader();
    let message = '';
    const nextIndex = this.history.length;
    this.history[nextIndex] = {
      role: 'openai',
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
          let localContent;
          if (item.role === 'openai') {
            localContent = unsafeHTML(DOMPurify.sanitize(marked.parse(item.content)));
          } else {
            localContent = item.content;
          }
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
