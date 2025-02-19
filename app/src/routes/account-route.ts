import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';

import '../atomics/floating-menu.js';
import '../atomics/main-layout.js';
import '../components/chat-history.js';
import '../components/chat-input.js';
import '../components/chat-options.js';
import '../components/chat-provider.js';
import '../components/chat-threads.js';

@customElement('account-route')
export class AccountRoute extends LitElement {
  render() {
    return html` <p>Account</p> `;
  }
}
