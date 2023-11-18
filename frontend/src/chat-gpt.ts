import hljs from 'highlight.js';
import { css, html, LitElement, nothing } from 'lit';
import { customElement, query, state } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { marked } from 'marked';
import { chatGptStyles } from './chat-gpt.css.js';
import { ChatNav } from './chat-nav.js';
import { githubDarkDimmed } from './github-dark-dimmed.css.js';
import { loadingIcon } from './loading-icon.js';
import { store } from './store.js';
import { ChatHistory, Thread } from './types.js';
const renderer = {
  image(href = '', title = 'image', text = 'image') {
    return `
      <div style="display: flex;">
        <img src="${href}" alt="${text}" title="${title}" />
      </div>
    `;
  },
  code(code, language) {
    const validLang = !!(language && hljs.getLanguage(language));
    const highlighted = validLang ? hljs.highlight(code, { language }).value : code;
    //const highlight2 = highlighted.replaceAll(/&lt;/g, '<').replaceAll(/&gt;/g, '>');
    return `
    <div class="button-copy-container">
      <button class="copy" 
        onclick="(function() { 
          const codeBlock = this.parentElement.nextElementSibling.querySelector('code'); 
          const codeText = codeBlock.textContent; 
          navigator.clipboard.writeText(codeText); 
          this.textContent = 'Copied'; 
          setTimeout(() => { this.textContent = 'Copy'; }, 3000); 
        }).call(this)">
        Copy
      </button>
      </div>
    <pre><code class="hljs ${language}">${highlighted}</code></pre>
    `;
  }
};
marked.use({ renderer });
@customElement('chat-gpt')
export class ChatGPT extends LitElement {
  static styles = css`
    ${githubDarkDimmed}
    ${chatGptStyles}
  `;
  @query('textarea') textareaEl: HTMLTextAreaElement;
  @state() loading = false;
  @state() history: ChatHistory = [];
  @state() miniPreviewImageURL = '';
  @state() engine =
    sessionStorage.getItem('engine') ?? document.querySelector<ChatNav>('chat-nav').engine ?? 'gpt-4-1106-preview';
  connectedCallback() {
    super.connectedCallback();
    store.subscribe<Thread>('activeThread', (thread) => {
      this.history = thread.history;
      console.log(this.history);
      this.requestUpdate();
      console.log('history sub fire');
    });
  }
  async performPostRequest(endpoint: string, body: any): Promise<any> {
    this.loading = true;
    let headers = {};
    if (body instanceof FormData) {
      headers = {
        Accept: 'application/json'
      };
    } else {
      headers = {
        'Content-Type': 'application/json',
        Accept: endpoint === '/' ? 'text/event-stream' : 'application/json'
      };
    }
    const response = await fetch(`http://localhost:8081${endpoint}`, {
      method: 'POST',
      headers,
      body: body instanceof FormData ? body : JSON.stringify(body)
    });
    return response;
  }

  async submit(e: Event) {
    const engine = document.querySelector<ChatNav>('chat-nav').engine;
    switch (engine) {
      case 'gpt-4-1106-preview':
      case 'gpt-4':
      case 'gpt-3.5-turbo':
        await this.runChatReq();
        break;
      case 'dall-e-2':
      case 'dall-e-3':
        await this.runImageReq();
        break;
      case 'gpt-4-vision-preview':
        await this.runVisionReq();
        break;
      case 'tts-1':
        await this.runTtsReq();
        break;
      case 'vertex':
        await this.runVertexReq();
        break;
      default:
        console.log('invalid engine');
        break;
    }
  }

  async runChatReq() {
    const engine = document.querySelector<ChatNav>('chat-nav').engine;
    const element = this.textareaEl;
    const prompt = element.value;
    const includeContext = document.querySelector<ChatNav>('chat-nav').includeContext;
    element.value = '';
    await this.addToHistory('user', prompt);

    const reqBody = {
      ...(includeContext
        ? {
            messages: [
              { role: 'system', content: document.querySelector<ChatNav>('chat-nav').systemMessage },
              ...this.history.map((item) => ({ role: item.role, content: item.content }))
            ]
          }
        : {
            messages: [
              { role: 'system', content: document.querySelector<ChatNav>('chat-nav').systemMessage },
              { role: 'user', content: prompt }
            ]
          }),
      engine: engine
    };
    try {
      const response = await this.performPostRequest('/', reqBody);

      const reader = response.body.getReader();
      let message = '';
      const nextIndex = this.history.length;
      this.addToHistory('assistant', '');

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        message = new TextDecoder().decode(value);
        this.updateAssistantResponse(nextIndex, message);
        this.loading = false;
        this.shadowRoot.querySelector('.history-outer').scrollTop = 0;
      }
      this.writeToSessionStorage();
    } catch (err) {
      this.addToHistory('assistant', 'http error. try again');
    } finally {
      this.loading = false;
    }
  }

  async runVertexReq() {
    const element = this.textareaEl;
    const prompt = element.value;
    element.value = '';
    const includeContext = document.querySelector<ChatNav>('chat-nav').includeContext;
    this.addToHistory('user', prompt);

    const requestBody = {
      ...(includeContext
        ? {
            messages: [
              ...this.history.map((item) => ({
                role: item.role === 'assistant' ? 'bot' : 'user',
                content: item.content
              }))
            ]
          }
        : {
            messages: [{ role: 'user', content: prompt }]
          })
    };

    try {
      const response = await this.performPostRequest('/vertex', requestBody);
      const json = await response.json();
      console.log('json', json);
      if (!json.content) {
        throw new Error('No content in response');
      }
      // Assuming `json.content` is the part of the response you want to display
      this.addToHistory('assistant', json.content);
    } catch (err: any) {
      console.error(err);
      this.addToHistory('assistant', `Vertex AI error: ${err.message}. Try again.`);
    } finally {
      this.loading = false;
    }
  }

  async runVisionReq() {
    const element = this.textareaEl;
    const prompt = element.value;
    element.value = '';
    this.miniPreviewImageURL = '';
    try {
      const form = new FormData();
      const file = this.shadowRoot.querySelector<HTMLInputElement>('input[type=file]').files[0];
      form.append('file', file);
      this.addToHistory('user', `![image](${URL.createObjectURL(file)})`);
      const response = await this.performPostRequest('/vision', form);
      if (response.status !== 200) {
        throw new Error('http error. try again');
      }
      const json = await response.json();
      if (!json.content) {
        throw new Error('no content in response');
      }
      this.addToHistory('assistant', json.content);
    } catch (err) {
      this.addToHistory('assistant', `http error.${err} try again`);
    } finally {
      this.loading = false;
    }
  }

  writeToSessionStorage() {
    try {
      sessionStorage.setItem('history', JSON.stringify(this.history));
    } catch (err) {
      console.log('error writing to session storage. probably full. clear history and try again', err);
    }
  }

  async runImageReq() {
    const engine = document.querySelector<ChatNav>('chat-nav').engine;
    const element = this.textareaEl;
    const prompt = element.value;
    element.value = '';
    this.addToHistory('user', prompt);

    const requestBody = {
      model: engine,
      prompt: prompt,
      n: 1,
      size: '1024x1024'
    };
    try {
      const response = await this.performPostRequest('/image', requestBody);
      const imgResp = (await response.json()) as { url: string };
      const imgMarkdown = `![image](${imgResp.url})`;
      this.addToHistory('assistant', imgMarkdown);
    } catch (err) {
      this.addToHistory('assistant', 'http error. try again');
    } finally {
      this.loading = false;
    }
  }

  async runTtsReq() {
    const element = this.textareaEl;
    const prompt = element.value;
    element.value = '';
    this.addToHistory('user', prompt);
    const requestBody = {
      model: 'tts-1',
      input: prompt,
      voice: 'nova'
    };

    try {
      const response = await this.performPostRequest('/tts', requestBody);
      if (response.ok) {
        const blob = await response.blob();
        const audioUrl = URL.createObjectURL(blob);
        this.addToHistory(
          'assistant',
          `Audio response received. Click to play.`,
          `<audio controls src="${audioUrl}"></audio>`
        );
      } else {
        throw new Error('Non-OK response from TTS endpoint');
      }
    } catch (err) {
      this.addToHistory('assistant', 'TTS error. Try again.');
    } finally {
      this.loading = false;
      console.log('loading false');
    }
  }

  async addToHistory(role: 'user' | 'assistant', content: string, custom?: string) {
    const newChat = { role, content, ...(custom ? { custom: custom } : {}) };
    await store.addMessage(newChat);
  }

  updateAssistantResponse(index: number, newContent: string) {
    store.addToMessageContent(newContent, index);
  }
  deleteItem(item) {
    this.history = this.history.filter((i) => i !== item);
    this.writeToSessionStorage();
  }
  render() {
    return html`
      <div class="history-outer">
        ${loadingIcon(this.loading)}
        ${[...this.history].reverse().map(
          (item) => html`
            <p class="history ${item.role}">
              <button class="delete" @click=${(e) => this.deleteItem(item)}>x</button>
              ${unsafeHTML(marked.parse(item.content))} ${item.custom ? unsafeHTML(item.custom as string) : nothing}
            </p>
          `
        )}
      </div>
      <div class="inputs-outer">
        <div class="inputs-inner">
          <textarea
            ?disabled=${this.engine === 'gpt-4-vision-preview'}
            title="Enter to send. Shift+Enter for new line."
            @keydown=${(e) => {
              if (e.key === 'Enter' && e.shiftKey) return;
              if (e.key === 'Enter') {
                e.preventDefault();
                this.submit(e);
                return;
              }
            }}></textarea>
          <div class="buttons">
            ${this.miniPreviewImageURL
              ? html` <div class="mini-preview"><img src="${this.miniPreviewImageURL}" /></div>`
              : nothing}
            ${this.engine?.includes('vision')
              ? html`
                  <input
                    type="file"
                    accept="image/*"
                    style="display: none"
                    @change=${(e: Event & { target: HTMLInputElement }) => {
                      console.log('e', e.target.files);
                      this.miniPreviewImageURL = URL.createObjectURL(e.target.files[0]);
                    }} />
                  <button
                    @click=${() => {
                      const input = this.shadowRoot.querySelector('input');
                      input.click();
                    }}>
                    Upload Image
                  </button>
                `
              : nothing}
            <button @click=${this.submit}>Send</button>
          </div>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'chat-gpt': ChatGPT;
  }
}
