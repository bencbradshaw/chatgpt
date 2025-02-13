import { LitElement, css, html } from 'lit';
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
      --nav-width: 200px;
      display: grid;
      grid-template-rows: auto 1fr auto;
      grid-template-columns: var(--nav-width) 1fr;
      height: 100vh;
      width: 100vw;
    }

    nav {
      border-radius: 20px;
      grid-row: 1 / 4;
      grid-column: 1 / 2;
      display: flex;
      flex-direction: column;
      margin: 20px 0;
    }

    header {
      grid-row: 1 / 2;
      grid-column: 2 / 3;
    }

    main {
      background-color: var(--chatbox-bg-color);
      grid-row: 2 / 3;
      grid-column: 2 / 3;
      display: flex;
      flex-direction: column;
      overflow-y: hidden;
      border-top-left-radius: 20px;
      border-top-right-radius: 20px;
      margin: 20px 0.5rem 0 0.5rem;
      max-width: calc(100vw - var(--nav-width));
    }

    footer {
      background-color: var(--chatbox-bg-color);
      grid-row: 3 / 4;
      grid-column: 2 / 3;
      border-bottom-right-radius: 20px;
      border-bottom-left-radius: 20px;
      margin: 0 0.5rem 0.5rem 0.5rem;
      max-width: calc(100vw - var(--nav-width));
    }
  `;

  render() {
    return html`
      <nav>
        <slot name="nav"></slot>
      </nav>
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
