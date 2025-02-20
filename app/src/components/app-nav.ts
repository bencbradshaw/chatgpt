import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('app-nav')
class AppNav extends LitElement {
  render() {
    return html`<div slot="header">
      <a href="/app/">Home</a>
      <a href="/app/account">Account</a>
    </div>`;
  }
}
