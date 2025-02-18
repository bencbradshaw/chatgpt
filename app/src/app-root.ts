import { Router } from 'go-web-framework/router.js';
import { LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';

import './atomics/floating-menu.js';
import './atomics/main-layout.js';
import './components/chat-history.js';
import './components/chat-input.js';
import './components/chat-options.js';
import './components/chat-provider.js';
import './components/chat-threads.js';

@customElement('app-root')
export class AppRoot extends LitElement {
  connectedCallback(): void {
    super.connectedCallback();
    const router = new Router(this);
    router.baseUrl = '/app';
    router.addRoute('/', 'chat-route', () => import('./routes/chat-route.js'));
    router.addRoute('/account', 'account-route', () => import('./routes/account-route.js'));
    router.navigate(window.location.pathname);
  }
}
