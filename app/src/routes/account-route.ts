import { LitElement, css, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import '../atomics/theme-toggle.js';
import '../components/app-nav.js';
import buttonsCss from '../styles/buttons.css.js';
import inputCss from '../styles/input.css.js';
@customElement('account-route')
export class AccountRoute extends LitElement {
  static styles = [inputCss, buttonsCss, css``];
  render() {
    return html`
      <theme-toggle> </theme-toggle>
      <app-nav></app-nav>
      <input placeholder="email" />
      <input placeholder="OpenAI API Key" />
      <button>Save</button>
    `;
  }
}
