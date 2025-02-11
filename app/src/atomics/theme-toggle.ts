import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('theme-toggle')
export class ThemeToggle extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    .toggle-btn {
      cursor: pointer;
      padding: 0.5rem;
      margin: 0 10px;
      border: none;
      border-radius: 5px;
      background-color: var(--button-bg-color);
      color: var(--primary-font-color);
    }

    .toggle-btn:hover {
      background-color: var(--button-bg-color-hover);
    }
  `;

  @property() isDarkTheme = true;
  connectedCallback(): void {
    super.connectedCallback();
    document.body.classList.add('dark');
    this.isDarkTheme = true;
  }
  toggleTheme() {
    if (document.body.classList.contains('dark')) {
      document.body.classList.remove('dark');
      document.body.classList.add('light');
    } else {
      document.body.classList.remove('light');
      document.body.classList.add('dark');
    }
    this.isDarkTheme = !this.isDarkTheme;
  }

  render() {
    return html` <button class="toggle-btn" @click=${this.toggleTheme}>Toggle Theme</button> `;
  }
}
