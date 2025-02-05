import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import './components/chat-provider.js';
import './atomics/main-layout.js';
import './components/chat-history.js';
import './components/chat-nav.js';
import './components/chat-threads.js';
import './components/chat-input.js';

@customElement('app-root')
export class AppRoot extends LitElement {
  render() {
    return html`
      <chat-provider>
        <main-layout>
          <chat-nav slot="header"></chat-nav>
          <chat-threads slot="nav"></chat-threads>
          <chat-history></chat-history>
          <chat-input slot="footer"></chat-input>
        </main-layout>
      </chat-provider>
    `;
  }
}
