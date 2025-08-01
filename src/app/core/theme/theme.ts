import { Injectable, signal } from '@angular/core';

export type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private themeSignal = signal<Theme>('light');
  
  public theme = this.themeSignal.asReadonly();

  constructor() {
    this.initializeTheme();
  }

  private initializeTheme(): void {
    // Check if we're in a browser environment
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      // Check for saved theme preference or default to light
      const savedTheme = localStorage.getItem('markt-theme') as Theme;
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      
      const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
      this.setTheme(initialTheme);
    } else {
      // Default to light theme for SSR
      this.setTheme('light');
    }
  }

  public setTheme(theme: Theme): void {
    this.themeSignal.set(theme);
    
    // Only set document attribute and localStorage if in browser
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
    }
    
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('markt-theme', theme);
    }
  }

  public toggleTheme(): void {
    const currentTheme = this.themeSignal();
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }

  public isDark(): boolean {
    return this.themeSignal() === 'dark';
  }

  public isLight(): boolean {
    return this.themeSignal() === 'light';
  }
}
