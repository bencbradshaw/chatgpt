import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';

import '../atomics/floating-menu.js';
import '../atomics/main-layout.js';
import '../components/chat-history.js';
import '../components/chat-input.js';
import '../components/chat-options.js';
import '../components/chat-provider.js';
import '../components/chat-threads.js';

@customElement('chat-route')
export class ChatRoute extends LitElement {
  render() {
    return html`
      <chat-provider>
        <main-layout>
          <div slot="header">
            <a href="/">Home</a>
            <a href="/account">Account</a>
          </div>
          <chat-threads slot="nav"></chat-threads>
          <chat-history></chat-history>
          <chat-input slot="footer"></chat-input>
        </main-layout>
      </chat-provider>
    `;
  }
}
