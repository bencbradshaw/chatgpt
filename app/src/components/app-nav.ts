import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import inputStyles from '../styles/input.css.js';
import typography from '../styles/typography.js';

@customElement('app-nav')
class AppNav extends LitElement {
  static styles = [inputStyles, typography];
  render() {
    return html`<div slot="header">
      <a href="/app/">Chat</a>
      <a href="/app/account">Account</a>
      <a href="/app/system-messages">System Messages</a>
    </div>`;
  }
}
