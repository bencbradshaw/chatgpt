import { LitElement, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

@customElement('floating-menu')
export class FloatingMenu extends LitElement {
  static styles = css`
    :host {
      position: relative;
    }
    :popover-open {
      display: flex;
      position: absolute;
      inset: unset;
      border: 0;
      outline: none;
      padding: 0;
      background-color: white;
      box-shadow: var(--box-shadow-1);
      border-radius: 5px;
    }
  `;
  @state() opened = false;
  @property({ type: String, reflect: true }) position: 'top' | 'bottom' = 'bottom';

  close() {
    const popoverEl = this.shadowRoot.querySelector('div[popover') as HTMLElement;
    popoverEl.hidePopover();
    this.opened = false;
  }

  #handleClicked(e: PointerEvent) {
    e.stopPropagation();

    if (this.opened) {
      this.close();
      return;
    }
    const popoverEl = this.shadowRoot.querySelector('#menu') as HTMLElement;
    const invoker = this.shadowRoot.querySelector('#target') as HTMLElement;
    const invokerRect = invoker.getBoundingClientRect();
    popoverEl.showPopover();
    const offsetBuffer = 4;
    if (this.position === 'top') {
      popoverEl.style.left = `${invokerRect.x + invokerRect.width + offsetBuffer}px`;
      popoverEl.style.top = `${invokerRect.y - popoverEl.offsetHeight - offsetBuffer}px`;
    } else if (this.position === 'bottom') {
      popoverEl.style.left = `${invokerRect.x + invokerRect.width + offsetBuffer}px`;
      popoverEl.style.top = `${invokerRect.y + invokerRect.height + offsetBuffer}px`;
    }
    this.opened = true;
  }

  render() {
    return html`
      <div id="target" @click=${this.#handleClicked}>
        <slot name="invoker"></slot>
      </div>
      <div id="menu" popover>
        <slot></slot>
      </div>
    `;
  }
}
