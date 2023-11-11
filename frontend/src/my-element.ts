import { css, html, LitElement } from 'lit';
import { customElement, state } from 'lit/decorators.js';

@customElement('my-element')
export class MyElement extends LitElement {
  static styles = css`
    div.history {
      display: flex;
      flex-direction: column-reverse;
      align-items: flex-start;
      justify-content: flex-start;
      height: 500px;
      max-width: 800px;
      width: 800px;
      overflow: hidden auto;
    }
    div.inputs {
      display: flex;
      align-items: flex-end;
      justify-content: center;
    }
    textarea {
      width: 400px;
      max-width: 400px;
      height: 50px;
      margin: 10px;
      padding: 6px 10px;
    }
    button {
      margin: 10px;
    }
  `;

  @state() history = [];

  async submit() {
    const element = this.shadowRoot?.querySelector('textarea');
    const prompt = element.value;
    element.value = '';
    this.history = [...this.history, prompt];
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
    this.history[nextIndex] = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      message = new TextDecoder().decode(value);
      this.history[nextIndex] += message;
      this.history = [...this.history];
    }
  }

  render() {
    return html`
      <div class="history">${[...this.history].reverse().map((item) => html` <p>${item}</p> `)}</div>
      <div class="inputs">
        <textarea
          @keydown=${(e) => {
            if (e.key === 'Enter' && e.shiftKey && e.preventDefault()) return;

            e.key === 'Enter' && this.submit();
          }}></textarea>
        <button @click=${this.submit}>Send</button>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'my-element': MyElement;
  }
}
