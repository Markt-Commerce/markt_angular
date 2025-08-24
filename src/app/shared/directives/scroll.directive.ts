import { Directive, ElementRef, EventEmitter, HostListener, Output } from '@angular/core';

@Directive({
  selector: '[scroll]',
  standalone: true
})
export class ScrollDirective {
  @Output() scrollEvent = new EventEmitter<{ scrollY: number; direction: 'up' | 'down' }>();

  private lastScrollY = 0;

  constructor(private elementRef: ElementRef) {
    // Initialize with current scroll position
    this.lastScrollY = window.scrollY;
  }

  @HostListener('window:scroll', ['$event'])
  public onScroll(event: Event) {
    const currentScrollY = window.scrollY;
    const direction: 'up' | 'down' = currentScrollY > this.lastScrollY ? 'down' : 'up';
    
    this.scrollEvent.emit({
      scrollY: currentScrollY,
      direction
    });
    
    this.lastScrollY = currentScrollY;
  }
}
