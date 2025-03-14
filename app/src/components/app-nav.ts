import { LitElement, css, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import buttonsCss from '../styles/buttons.css.js';

@customElement('app-nav')
class AppNav extends LitElement {
  static styles = [
    buttonsCss,
    css`
      :host > * {
        margin-right: 0.5rem;
        display: inline-block;
      }
      :host {
        flex-grow: 1;
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
      }
      a,
      a:active,
      a:visited {
        text-decoration: none;
        color: transparent;
      }
    `
  ];
  render() {
    return html`
      <div>
        <a href="/app/">
          <button class="tab ${window.router.activeRoute.path === '/app/' ? 'active' : ''}">Chat</button>
        </a>
        <a href="/app/system-messages">
          <button class="tab ${window.router.activeRoute.path === '/app/system-messages' ? 'active' : ''}">
            System Messages
          </button>
        </a>
      </div>
      <theme-toggle> </theme-toggle>
    `;
  }
}
