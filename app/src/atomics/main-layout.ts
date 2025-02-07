import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('main-layout')
export class ThemeToggle extends LitElement {
  // layout
  // left 120px for the chat history
  // top 25px for the header
  // bottom 125px for the "footer", where the input will go
  // the rest is for the chat history, it will grow between top and bottom, and scroll
  static styles = css`
    :host {
      display: grid;
      grid-template-rows: auto 1fr auto;
      grid-template-columns: 120px 1fr;
      height: 100vh;
      width: 100vw;
    }

    section[nav] {
      grid-row: 1 / 4;
      grid-column: 1 / 2;
      display: flex;
      flex-direction: column;
    }

    header {
      grid-row: 1 / 2;
      grid-column: 2 / 3;
    }

    main {
      grid-row: 2 / 3;
      grid-column: 2 / 3;
      display: flex;
      flex-direction: column;
      overflow-y: hidden;
    }

    footer {
      grid-row: 3 / 4;
      grid-column: 2 / 3;
    }
  `;

  render() {
    return html`
      <section nav>
        <slot name="nav"></slot>
      </section>
      <header>
        <slot name="header"></slot>
      </header>
      <main>
        <slot></slot>
      </main>
      <footer>
        <slot name="footer"></slot>
      </footer>
    `;
  }
}
