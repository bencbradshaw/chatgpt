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

declare global {
  interface Window {
    router: Router;
  }
}

@customElement('app-root')
export class AppRoot extends LitElement {
  connectedCallback(): void {
    super.connectedCallback();
    const router = new Router(this);
    router.baseUrl = '/app';
    router.addRoute({
      path: '/',
      component: 'chat-route',
      importer: () => import('./routes/chat-route.js'),
      title: 'Chat'
    });
    router.addRoute({
      path: '/system-messages',
      component: 'system-messages',
      importer: () => import('./routes/system-messages-route.js'),
      title: 'System Messages'
    });
    router.navigate(window.location.pathname);
    window.router = router;
  }
}
