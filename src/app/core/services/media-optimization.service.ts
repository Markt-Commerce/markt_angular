import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class MediaOptimizationService {
  getPrimaryUrl(image: any): string {
    const m = image?.media || {};
    return m.desktop_url || m.mobile_url || m.original_url || m.thumbnail_url || '/markt-text-logo.png';
  }

  getSrcSet(image: any): string | null {
    const m = image?.media || {};
    const parts: string[] = [];
    if (m.thumbnail_url) parts.push(`${m.thumbnail_url} 320w`);
    if (m.mobile_url) parts.push(`${m.mobile_url} 640w`);
    if (m.desktop_url) parts.push(`${m.desktop_url} 1024w`);
    if (m.original_url) parts.push(`${m.original_url} 1600w`);
    return parts.length ? parts.join(', ') : null;
  }

  gridSizes(): string { return '(min-width:1536px) 20vw, (min-width:1280px) 25vw, (min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw'; }
  listThumbSizes(): string { return '112px'; }
} 