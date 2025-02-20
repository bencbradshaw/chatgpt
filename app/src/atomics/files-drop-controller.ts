import { LitElement, ReactiveController } from 'lit';

export class FilesDropController implements ReactiveController {
  cb: (files: FileList) => void;
  constructor(private host: LitElement, cb: (files: FileList) => void) {
    this.host.addController(this);
    this.cb = cb;
  }

  dragover(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
  }

  dragleave(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
  }

  drop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    this.cb(e.dataTransfer.files);
  };

  hostConnected() {
    this.host.addEventListener('dragover', this.dragover);
    this.host.addEventListener('dragleave', this.dragleave);
    this.host.addEventListener('drop', this.drop);
  }
  hostDisconnected() {
    this.host.removeEventListener('dragover', this.dragover);
    this.host.removeEventListener('dragleave', this.dragleave);
    this.host.removeEventListener('drop', this.drop);
  }
}
