import { Injectable } from '@angular/core';
import { Media } from '../models';

interface ImageWithMedia {
  media?: Media;
}

interface ProductWithImages {
  images?: Array<{ media?: Media }>;
  image_url?: string;
}

@Injectable({ providedIn: 'root' })
export class MediaOptimizationService {
  private readonly DEFAULT_IMAGE = '/markt-text-logo.png';
  private readonly SIZES = {
    thumbnail: 320,
    mobile: 640,
    desktop: 1024,
    original: 1600
  };

  getPrimaryUrl(image: ImageWithMedia | ProductWithImages | null | undefined): string {
    // Handle Product type with images array
    if (image && 'images' in image && image.images?.length) {
      const m = image.images[0]?.media;
      return m?.desktop_url || m?.mobile_url || m?.original_url || m?.thumbnail_url || image.image_url || this.DEFAULT_IMAGE;
    }
    
    // Handle ImageWithMedia type
    if (image && 'media' in image) {
      const m = image.media;
      return m?.desktop_url || m?.mobile_url || m?.original_url || m?.thumbnail_url || this.DEFAULT_IMAGE;
    }
    
    // Handle fallback
    if (image && 'image_url' in image) {
      return image.image_url || this.DEFAULT_IMAGE;
    }
    
    return this.DEFAULT_IMAGE;
  }

  getSrcSet(image: ImageWithMedia | ProductWithImages | null | undefined): string | null {
    // Handle Product type with images array
    if (image && 'images' in image && image.images?.length) {
      const m = image.images[0]?.media;
      if (!m) return null;
      
      const parts: string[] = [];
      if (m.thumbnail_url) parts.push(`${m.thumbnail_url} ${this.SIZES.thumbnail}w`);
      if (m.mobile_url) parts.push(`${m.mobile_url} ${this.SIZES.mobile}w`);
      if (m.desktop_url) parts.push(`${m.desktop_url} ${this.SIZES.desktop}w`);
      if (m.original_url) parts.push(`${m.original_url} ${this.SIZES.original}w`);
      return parts.length ? parts.join(', ') : null;
    }
    
    // Handle ImageWithMedia type
    if (image && 'media' in image) {
      const m = image.media;
      if (!m) return null;
      
      const parts: string[] = [];
      if (m.thumbnail_url) parts.push(`${m.thumbnail_url} ${this.SIZES.thumbnail}w`);
      if (m.mobile_url) parts.push(`${m.mobile_url} ${this.SIZES.mobile}w`);
      if (m.desktop_url) parts.push(`${m.desktop_url} ${this.SIZES.desktop}w`);
      if (m.original_url) parts.push(`${m.original_url} ${this.SIZES.original}w`);
      return parts.length ? parts.join(', ') : null;
    }
    
    return null;
  }

  getOptimalImageUrl(image: ImageWithMedia | ProductWithImages | null | undefined, maxWidth: number): string {
    // Handle Product type with images array
    if (image && 'images' in image && image.images?.length) {
      const m = image.images[0]?.media;
      if (!m) return image.image_url || this.DEFAULT_IMAGE;

      if (maxWidth <= this.SIZES.thumbnail) return m.thumbnail_url || m.mobile_url || m.original_url || image.image_url || this.DEFAULT_IMAGE;
      if (maxWidth <= this.SIZES.mobile) return m.mobile_url || m.desktop_url || m.original_url || image.image_url || this.DEFAULT_IMAGE;
      if (maxWidth <= this.SIZES.desktop) return m.desktop_url || m.original_url || image.image_url || this.DEFAULT_IMAGE;
      return m.original_url || image.image_url || this.DEFAULT_IMAGE;
    }
    
    // Handle ImageWithMedia type
    if (image && 'media' in image) {
      const m = image.media;
      if (!m) return this.DEFAULT_IMAGE;

      if (maxWidth <= this.SIZES.thumbnail) return m.thumbnail_url || m.mobile_url || m.original_url || this.DEFAULT_IMAGE;
      if (maxWidth <= this.SIZES.mobile) return m.mobile_url || m.desktop_url || m.original_url || this.DEFAULT_IMAGE;
      if (maxWidth <= this.SIZES.desktop) return m.desktop_url || m.original_url || this.DEFAULT_IMAGE;
      return m.original_url || this.DEFAULT_IMAGE;
    }
    
    return this.DEFAULT_IMAGE;
  }

  hasValidMedia(image: ImageWithMedia | ProductWithImages | null | undefined): boolean {
    // Handle Product type with images array
    if (image && 'images' in image && image.images?.length) {
      const m = image.images[0]?.media;
      return !!(m?.thumbnail_url || m?.mobile_url || m?.desktop_url || m?.original_url || image.image_url);
    }
    
    // Handle ImageWithMedia type
    if (image && 'media' in image) {
      const m = image.media;
      return !!(m?.thumbnail_url || m?.mobile_url || m?.desktop_url || m?.original_url);
    }
    
    return false;
  }

  gridSizes(): string { 
    return '(min-width:1536px) 20vw, (min-width:1280px) 25vw, (min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw'; 
  }
  
  listThumbSizes(): string { 
    return '112px'; 
  }
} 