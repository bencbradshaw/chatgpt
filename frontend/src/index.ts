import './index.css';
import { sseListener } from 'go-web-framework/sse.js';
await import('./components/chat-provider.js');
import('./components/chat-history.js');
import('./components/chat-nav.js');
import('./components/chat-threads.js');
document.addEventListener('DOMContentLoaded', async () => {
  sseListener('/events');
});
