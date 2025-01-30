import './index.css';
await import('./components/chat-provider.js');
import('./components/chat-history.js');
import('./components/chat-nav.js');
import('./components/chat-threads.js');

import sse from 'go-web-framework/sse.js';
sse('/events');
