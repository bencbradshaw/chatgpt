import { css, html, LitElement } from 'lit';
import { customElement, state } from 'lit/decorators.js';

@customElement('my-element')
export class MyElement extends LitElement {
  static styles = css``;

  @state() history = [];

  async submit() {
    this.history = [...this.history, this.shadowRoot?.querySelector('textarea')?.value];
    const resp = await fetch('http://localhost:8080', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ prompt: this.shadowRoot?.querySelector('textarea')?.value })
    });
    const message = (await resp.json()).message;
    this.history = [...this.history, message];
  }
  render() {
    return html`
      <textarea></textarea>
      <button @click=${this.submit}>Send</button>
      ${this.history.map((item) => html` <p>${item}</p> `)}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'my-element': MyElement;
  }
}
