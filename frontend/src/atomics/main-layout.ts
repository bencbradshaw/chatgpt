import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('main-layout')
export class ThemeToggle extends LitElement {
  static styles = css`
    // layout
    // left 120px for the chat history
    // top 25px for the header
    // bottom 125px for the "footer", where the input will go
    // the rest is for the chat history, it will grow between top and bottom, and scroll
    :host {
      display: grid;
      grid-template-rows: auto 1fr auto;
      grid-template-columns: 120px 1fr;
      height: 100vh;
    }

    section[name='nav'] {
      grid-row: 1 / 4;
      grid-column: 1 / 2;
      background-color: #f0f0f0;
      padding: 10px;
    }

    header {
      grid-row: 1 / 2;
      grid-column: 2 / 3;
      background-color: #e0e0e0;
      padding: 10px;
    }

    main {
      grid-row: 2 / 3;
      grid-column: 2 / 3;
      overflow-y: auto;
      padding: 10px;
    }

    section[name='footer'] {
      grid-row: 3 / 4;
      grid-column: 2 / 3;
      background-color: #d0d0d0;
      padding: 10px;
    }
  `;

  render() {
    return html`
      <section>
        <slot name="nav"></slot>
      </section>
      <header>
        <slot name="header"></slot>
      </header>
      <main>
        <slot></slot>
      </main>
      <section>
        <slot name="footer"></slot>
      </section>
    `;
  }
}
