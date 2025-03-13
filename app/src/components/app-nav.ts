import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import buttonsCss from '../styles/buttons.css.js';

@customElement('app-nav')
class AppNav extends LitElement {
  static styles = [buttonsCss];
  render() {
    return html`
      <a href="/app/">
        <button class="tab ${window.router.activeRoute.path === '/app/' ? 'active' : ''}">Chat</button>
      </a>
      <a href="/app/system-messages">
        <button class="tab ${window.router.activeRoute.path === '/app/system-messages' ? 'active' : ''}">
          System Messages
        </button>
      </a>
    `;
  }
}
