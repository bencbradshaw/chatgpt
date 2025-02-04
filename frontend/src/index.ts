import './index.css';
import './app-root.js';

import sse from 'go-web-framework/sse.js';

sse('/events', (e, d) => {
  if (e === 'esbuild') {
    window.location.reload();
  }
});
