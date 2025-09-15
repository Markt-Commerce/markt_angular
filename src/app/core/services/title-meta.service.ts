import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class TitleMetaService {
  private readonly DEFAULT_TITLE = 'Markt - Discover and Shop';
  private readonly DEFAULT_DESCRIPTION = 'Discover and shop on Markt. Connect with buyers and sellers in a vibrant marketplace.';

  setTitle(parts: string[]): void {
    const title = parts.filter(Boolean).join(' · ');
    document.title = title || this.DEFAULT_TITLE;
    
    // Update Open Graph title for better social media sharing
    this.setProperty('og:title', document.title);
  }

  setMeta(description?: string, keywords?: string, image?: string): void {
    const desc = description || this.DEFAULT_DESCRIPTION;
    
    // Basic meta tags for SEO
    this.setTag('description', desc);
    this.setTag('keywords', keywords || 'marketplace, shopping, buy, sell, community');
    this.setTag('robots', 'index, follow');
    this.setTag('viewport', 'width=device-width, initial-scale=1');
    
    // Open Graph tags for social media
    this.setProperty('og:description', desc);
    this.setProperty('og:type', 'website');
    this.setProperty('og:site_name', 'Markt');
    this.setProperty('og:image', image || '/assets/images/markt-og-image.png');
    this.setProperty('og:url', window.location.href);
    
    // Twitter Card tags
    this.setProperty('twitter:card', 'summary_large_image');
    this.setProperty('twitter:title', document.title);
    this.setProperty('twitter:description', desc);
    this.setProperty('twitter:image', image || '/assets/images/markt-og-image.png');
    
    // Canonical URL for SEO
    this.setCanonicalUrl(window.location.href);
  }

  setStructuredData(data: Record<string, any>): void {
    // Remove existing structured data
    const existingScript = document.querySelector('script[type="application/ld+json"]');
    if (existingScript) {
      existingScript.remove();
    }

    // Add new structured data
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(data);
    document.head.appendChild(script);
  }

  private setCanonicalUrl(url: string): void {
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', url);
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