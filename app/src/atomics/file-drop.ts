import { LitElement, html } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';

@customElement('file-drop')
export class FileDrop extends LitElement {
  @query('input') input: HTMLInputElement;
  @property() fileSelected: boolean = false;
  @property() allowMultiple: boolean = true;
  @property() overFromDrag: boolean = false;
  @property() accept: string = 'image/png, image/jpeg, image/jpg, .pdf';

  changeEvent: CustomEvent = new CustomEvent('change', {
    detail: { message: 'change', value: null },
    bubbles: true,
    composed: true
  });

  firstUpdated() {
    this.input.addEventListener('change', (e) => {
      const target = e.target as HTMLInputElement;
      this.valueChanged(target);
    });
  }

  private valueChanged(target: HTMLInputElement) {
    this.changeEvent.detail.value = target.files;
    this.dispatchEvent(this.changeEvent);
  }

  dragover(e: DragEvent) {
    this.overFromDrag = true;
    e.preventDefault();
    e.stopPropagation();
  }

  dragleave(e: DragEvent) {
    this.overFromDrag = false;
    e.preventDefault();
    e.stopPropagation();
  }

  drop(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    this.changeEvent.detail.value = e.dataTransfer.files;
    this.dispatchEvent(this.changeEvent);
    this.overFromDrag = false;
  }

  clickInput(e) {
    this.input.click();
  }

  render() {
    return html`
      <input
        style="display:none"
        type="file"
        id="files"
        name="upload"
        accept="${this.accept}"
        ?multiple="${this.allowMultiple}" />
      <section
        @dragenter=${this.dragover}
        @dragleave=${this.dragleave}
        @dragover=${this.dragover}
        @drop=${this.drop}></section>
    `;
  }
}
