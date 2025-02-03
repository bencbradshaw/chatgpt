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

  lightThemeVars = {
    '--primary-font-color': '#000000',
    '--primary-bg-color': '#ffffff',
    '--chatbox-bg-color': '#f6f8fa',
    '--button-bg-color': '#f0f1f4',
    '--button-bg-color-hover': '#e1e4e8',
    '--color': 'rgba(0, 0, 0, 0.87)',
    'background-color': '#ffffff'
  };

  darkThemeVars = {
    '--primary-font-color': '#ffffff',
    '--primary-bg-color': '#282c34',
    '--chatbox-bg-color': '#353b45',
    '--button-bg-color': '#3e4451',
    '--button-bg-color-hover': '#5e687e',
    '--color': 'rgba(255, 255, 255, 0.87)',
    'background-color': '#282c34'
  };
  @property() isDarkTheme = true;

  toggleTheme() {
    const newThemeVars = this.isDarkTheme ? this.lightThemeVars : this.darkThemeVars;
    for (const [key, value] of Object.entries(newThemeVars)) {
      document.documentElement.style.setProperty(key, value);
    }
    this.isDarkTheme = !this.isDarkTheme;
  }

  render() {
    return html` <button class="toggle-btn" @click=${this.toggleTheme}>Toggle Theme</button> `;
  }
}
