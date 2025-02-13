import { LitElement, css, html } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('floating-menu')
export class FloatingMenu extends LitElement {
  static styles = css`
    :host {
      position: relative;
    }
    [popover] {
      display: fixed;
    }
    :popover-open {
      display: flex;
      position: absolute;
      inset: unset;
      border: 0;
      outline: none;
      padding: 0;
      background-color: white;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
      border-radius: 5px;
    }
  `;
  close() {
    const popoverEl = this.shadowRoot.querySelector('div[popover') as HTMLElement;
    popoverEl.hidePopover();
  }
  #handleClicked(e: PointerEvent) {
    e.stopPropagation();
    const popoverEl = this.shadowRoot.querySelector('#menu') as HTMLElement;
    const invoker = this.shadowRoot.querySelector('#target') as HTMLElement;
    const invokerRect = invoker.getBoundingClientRect();
    popoverEl.showPopover();
    const offsetBuffer = 4;
    popoverEl.style.left = `${invokerRect.x + invokerRect.width + offsetBuffer}px`;
    popoverEl.style.top = `${invokerRect.y + invokerRect.height + offsetBuffer}px`;
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
