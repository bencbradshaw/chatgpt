import './index.css';
await import('./components/chat-provider.js');
import('./atomics/main-layout.js');
import('./components/chat-history.js');
import('./components/chat-nav.js');
import('./components/chat-threads.js');

import sse from 'go-web-framework/sse.js';
sse('/events', (e, d) => {
  if (e === 'esbuild') {
    window.location.reload();
  }
});
