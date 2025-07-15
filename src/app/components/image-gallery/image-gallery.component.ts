import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-image-gallery',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './image-gallery.component.html',
  styleUrl: './image-gallery.component.css',
})
export class ImageGalleryComponent {
  @Input() images: string[] = [];
  @Input() productName: string = '';
  @Input() currentIndex: number = 0;
  @Input() showOverlay: boolean = false;

  @Output() imageChange = new EventEmitter<number>();
  @Output() share = new EventEmitter<string>();
  @Output() download = new EventEmitter<string>();
  @Output() report = new EventEmitter<void>();

  isFullscreen: boolean = false;

  get selectedImage(): string {
    return this.images[this.currentIndex] || '';
  }

  onImageClick() {
    this.showOverlay = !this.showOverlay;
  }

  onZoom() {
    this.isFullscreen = true;
  }

  onFullscreen() {
    this.isFullscreen = true;
  }

  onCloseFullscreen() {
    this.isFullscreen = false;
  }

  onPrevious() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.imageChange.emit(this.currentIndex);
    }
  }

  onNext() {
    if (this.currentIndex < this.images.length - 1) {
      this.currentIndex++;
      this.imageChange.emit(this.currentIndex);
    }
  }

  onThumbnailClick(index: number) {
    this.currentIndex = index;
    this.imageChange.emit(this.currentIndex);
  }

  onShare() {
    this.share.emit(this.selectedImage);
  }

  onDownload() {
    this.download.emit(this.selectedImage);
  }

  onReport() {
    this.report.emit();
  }
}
