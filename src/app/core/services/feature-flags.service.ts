import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ApiService } from './api.service';

export type FeatureFlags = Record<string, boolean>;

const DEFAULT_FLAGS: FeatureFlags = {
  beta_banner: true,
  market_shops: false,
  chat_cta: true
};

@Injectable({ providedIn: 'root' })
export class FeatureFlagService {
  private api = inject(ApiService);
  private flagsSubject = new BehaviorSubject<FeatureFlags>({ ...DEFAULT_FLAGS });
  public flags$ = this.flagsSubject.asObservable();

  constructor() {
    this.loadFlags();
  }

  private loadFlags(): void {
    const local = this.readLocal();
    if (local) this.flagsSubject.next({ ...DEFAULT_FLAGS, ...local });

    this.api.getUserSettings().pipe(
      map((res: any) => (res?.data || res || {})),
      catchError(() => of({}))
    ).subscribe(settings => {
      const flags = (settings.flags as FeatureFlags) || {};
      const merged = { ...DEFAULT_FLAGS, ...flags };
      this.flagsSubject.next(merged);
      this.writeLocal(merged);
    });
  }

  isEnabled(flag: string): boolean {
    return !!this.flagsSubject.value[flag];
  }

  set(flag: string, enabled: boolean): void {
    const next = { ...this.flagsSubject.value, [flag]: enabled };
    this.flagsSubject.next(next);
    this.writeLocal(next);
  }

  private readLocal(): FeatureFlags | null {
    try {
      const raw = localStorage.getItem('markt_flags');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  private writeLocal(flags: FeatureFlags): void {
    try {
      localStorage.setItem('markt_flags', JSON.stringify(flags));
    } catch {}
  }
} 