import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class TitleMetaService {
  setTitle(parts: string[]): void {
    const title = parts.filter(Boolean).join(' · ');
    document.title = title || 'Markt';
  }

  setMeta(description?: string): void {
    this.setTag('description', description || 'Discover and shop on Markt.');
    this.setProperty('og:title', document.title);
    if (description) this.setProperty('og:description', description);
  }

  private setTag(name: string, content: string): void {
    let el = document.querySelector(`meta[name="${name}"]`);
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute('name', name);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  }

  private setProperty(property: string, content: string): void {
    let el = document.querySelector(`meta[property="${property}"]`);
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute('property', property);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  }
} 