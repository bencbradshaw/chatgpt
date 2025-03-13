import { LitElement, css, html } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('page-layout')
export class PageLayout extends LitElement {
  // layout
  // top 25px for the header
  // bottom 125px for the "footer"
  // the rest is for the main content area, which will grow between top and bottom, and scroll
  static styles = css`
    :host {
      display: grid;
      grid-template-rows: auto 1fr auto;
      height: 100vh;
      width: 100vw;
    }

    header {
      grid-row: 1 / 2;
    }

    main {
      background-color: var(--chatbox-bg-color);
      grid-row: 2 / 3;
      display: flex;
      flex-direction: column;
      overflow-y: auto;
      border-top-left-radius: 20px;
      border-top-right-radius: 20px;
      margin: 20px 0.5rem 0 0.5rem;
    }

    footer {
      background-color: var(--chatbox-bg-color);
      grid-row: 3 / 4;
      border-bottom-right-radius: 20px;
      border-bottom-left-radius: 20px;
      margin: 0 0.5rem 0.5rem 0.5rem;
    }
  `;

  render() {
    return html`
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
