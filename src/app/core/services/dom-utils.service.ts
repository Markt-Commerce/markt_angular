import { Injectable, Renderer2, RendererFactory2, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class DomUtilsService {
  private renderer: Renderer2;

  constructor(
    rendererFactory: RendererFactory2,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.renderer = rendererFactory.createRenderer(null, null);
  }

  /**
   * Safely check if we're in browser environment
   */
  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  /**
   * Safely scroll to an element
   */
  scrollToElement(element: HTMLElement, behavior: ScrollBehavior = 'smooth'): void {
    if (this.isBrowser() && element) {
      element.scrollIntoView({ behavior, block: 'start' });
    }
  }

  /**
   * Safely focus an element
   */
  focusElement(element: HTMLElement): void {
    if (this.isBrowser() && element) {
      element.focus();
    }
  }

  /**
   * Safely get element by ID
   */
  getElementById(id: string): HTMLElement | null {
    if (!this.isBrowser()) return null;
    return document.getElementById(id);
  }

  /**
   * Safely query selector
   */
  querySelector(selector: string): HTMLElement | null {
    if (!this.isBrowser()) return null;
    return document.querySelector(selector);
  }

  /**
   * Safely query selector all
   */
  querySelectorAll(selector: string): NodeListOf<Element> {
    if (!this.isBrowser()) return document.querySelectorAll('');
    return document.querySelectorAll(selector);
  }

  /**
   * Safely add event listener using Renderer2
   */
  addEventListener(element: HTMLElement, event: string, handler: EventListener): () => void {
    if (!this.isBrowser()) return () => {};
    
    this.renderer.listen(element, event, handler);
    
    // Return cleanup function
    return () => {
      element.removeEventListener(event, handler);
    };
  }

  /**
   * Safely add window event listener
   */
  addWindowEventListener(event: string, handler: EventListener): () => void {
    if (!this.isBrowser()) return () => {};
    
    this.renderer.listen('window', event, handler);
    
    // Return cleanup function
    return () => {
      window.removeEventListener(event, handler);
    };
  }

  /**
   * Safely add document event listener
   */
  addDocumentEventListener(event: string, handler: EventListener): () => void {
    if (!this.isBrowser()) return () => {};
    
    this.renderer.listen('document', event, handler);
    
    // Return cleanup function
    return () => {
      document.removeEventListener(event, handler);
    };
  }

  /**
   * Safely set element property
   */
  setProperty(element: HTMLElement, property: string, value: any): void {
    if (this.isBrowser() && element) {
      this.renderer.setProperty(element, property, value);
    }
  }

  /**
   * Safely add/remove CSS classes
   */
  addClass(element: HTMLElement, className: string): void {
    if (this.isBrowser() && element) {
      this.renderer.addClass(element, className);
    }
  }

  removeClass(element: HTMLElement, className: string): void {
    if (this.isBrowser() && element) {
      this.renderer.removeClass(element, className);
    }
  }

  /**
   * Safely set element style
   */
  setStyle(element: HTMLElement, style: string, value: string): void {
    if (this.isBrowser() && element) {
      this.renderer.setStyle(element, style, value);
    }
  }

  /**
   * Safely remove element style
   */
  removeStyle(element: HTMLElement, style: string): void {
    if (this.isBrowser() && element) {
      this.renderer.removeStyle(element, style);
    }
  }

  /**
   * Safely get window scroll position
   */
  getScrollPosition(): { x: number; y: number } {
    if (!this.isBrowser()) return { x: 0, y: 0 };
    
    return {
      x: window.scrollX || window.pageXOffset,
      y: window.scrollY || window.pageYOffset
    };
  }

  /**
   * Safely scroll window to position
   */
  scrollTo(x: number, y: number, behavior: ScrollBehavior = 'smooth'): void {
    if (this.isBrowser()) {
      window.scrollTo({ left: x, top: y, behavior });
    }
  }

  /**
   * Safely copy text to clipboard
   */
  async copyToClipboard(text: string): Promise<boolean> {
    if (!this.isBrowser()) return false;
    
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        const result = document.execCommand('copy');
        document.body.removeChild(textArea);
        return result;
      }
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      return false;
    }
  }

  /**
   * Safely open URL in new window/tab
   */
  openUrl(url: string, target: string = '_blank'): void {
    if (this.isBrowser()) {
      window.open(url, target, 'noopener,noreferrer');
    }
  }

  /**
   * Safely print current page
   */
  print(): void {
    if (this.isBrowser()) {
      window.print();
    }
  }

  /**
   * Safely get active element
   */
  getActiveElement(): HTMLElement | null {
    if (!this.isBrowser()) return null;
    return document.activeElement as HTMLElement;
  }

  /**
   * Safely get all focusable elements in a container
   */
  getFocusableElements(container: HTMLElement): HTMLElement[] {
    if (!this.isBrowser() || !container) return [];
    
    const focusable = Array.from(
      container.querySelectorAll<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
    ).filter(el => !el.hasAttribute('disabled'));
    
    return focusable;
  }

  /**
   * Safely handle keyboard navigation
   */
  handleKeyboardNavigation(
    event: KeyboardEvent,
    focusableElements: HTMLElement[],
    currentIndex: number
  ): { newIndex: number; shouldPreventDefault: boolean } {
    if (!this.isBrowser() || focusableElements.length === 0) {
      return { newIndex: currentIndex, shouldPreventDefault: false };
    }

    let newIndex = currentIndex;
    let shouldPreventDefault = false;

    switch (event.key) {
      case 'Tab':
        if (event.shiftKey) {
          newIndex = currentIndex > 0 ? currentIndex - 1 : focusableElements.length - 1;
        } else {
          newIndex = currentIndex < focusableElements.length - 1 ? currentIndex + 1 : 0;
        }
        shouldPreventDefault = true;
        break;
      case 'ArrowDown':
      case 'ArrowRight':
        newIndex = currentIndex < focusableElements.length - 1 ? currentIndex + 1 : 0;
        shouldPreventDefault = true;
        break;
      case 'ArrowUp':
      case 'ArrowLeft':
        newIndex = currentIndex > 0 ? currentIndex - 1 : focusableElements.length - 1;
        shouldPreventDefault = true;
        break;
      case 'Home':
        newIndex = 0;
        shouldPreventDefault = true;
        break;
      case 'End':
        newIndex = focusableElements.length - 1;
        shouldPreventDefault = true;
        break;
    }

    if (newIndex !== currentIndex && focusableElements[newIndex]) {
      this.focusElement(focusableElements[newIndex]);
    }

    return { newIndex, shouldPreventDefault };
  }
}
