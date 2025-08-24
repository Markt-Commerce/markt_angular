import { Injectable, inject } from '@angular/core';
import { TypeSafetyService } from './type-safety.service';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { BehaviorSubject, Observable, combineLatest, of } from 'rxjs';
import { filter, map, switchMap, shareReplay } from 'rxjs/operators';
import { ApiService } from './api.service';

export interface BreadcrumbItem {
  label: string;
  url: string | null;
}

@Injectable({ providedIn: 'root' })
export class BreadcrumbsService {
  private typeSafety = inject(TypeSafetyService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private api = inject(ApiService);

  private breadcrumbsSubject = new BehaviorSubject<BreadcrumbItem[]>([]);
  public breadcrumbs$ = this.breadcrumbsSubject.asObservable();

  // Simple in-memory caches per entity type
  private productLabelCache = new Map<string, string>();
  private userLabelCache = new Map<string, string>();
  private orderLabelCache = new Map<string, string>();
  private requestLabelCache = new Map<string, string>();
  private chatLabelCache = new Map<string, string>();
  private postLabelCache = new Map<string, string>();

  constructor() {
    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe(() => {
      this.buildBreadcrumbs().subscribe(items => this.breadcrumbsSubject.next(items));
    });
  }

  private buildBreadcrumbs(): Observable<BreadcrumbItem[]> {
    const root = this.route.root;
    const segments: { route: ActivatedRoute; url: string }[] = [];

    let current: ActivatedRoute | null = root;
    let url = '';

    while (current) {
      const routeConfig = current.routeConfig;
      const path = routeConfig?.path || '';
      if (path) {
        const filledPath = path.split('/').map(seg => {
          if (seg.startsWith(':')) {
            const key = seg.slice(1);
            const val = current!.snapshot.paramMap.get(key) || '';
            return val;
          }
          return seg;
        }).join('/');
        url += '/' + filledPath;
      }
      segments.push({ route: current, url });
      current = current.firstChild;
    }

    const itemObservables: Observable<BreadcrumbItem | null>[] = segments.map((seg, idx, arr) => {
      const data: any = seg.route.snapshot.data || {};
      if (data['hideBreadcrumbs']) return of(null);

      const isLast = idx === arr.length - 1;
      const linkUrl = isLast ? null : seg.url || '/';

      // Static label
      if (typeof data['breadcrumb'] === 'string') {
        return of({ label: data['breadcrumb'], url: linkUrl });
      }

      // Dynamic label by type
      const bc = data['breadcrumb'] as { type?: string } | undefined;
      if (bc?.type === 'product') {
        const id = seg.route.snapshot.paramMap.get('id') || '';
        if (!id) return of({ label: 'Product', url: linkUrl });
        const cached = this.productLabelCache.get(id);
        if (cached) return of({ label: cached, url: linkUrl });
        return this.api.getProduct(id).pipe(
          map(res => {
            const data = this.typeSafety.getProperty(res, 'data.item') || this.typeSafety.getProperty(res, 'data.product') || this.typeSafety.getProperty(res, 'data') || res;
            const name = this.typeSafety.toString(this.typeSafety.getProperty(data, 'name'), 'Product');
            this.productLabelCache.set(id, name);
            return { label: name, url: linkUrl } as BreadcrumbItem;
          })
        );
      }
      if (bc?.type === 'user') {
        const id = seg.route.snapshot.paramMap.get('id') || '';
        if (!id) return of({ label: 'User', url: linkUrl });
        const cached = this.userLabelCache.get(id);
        if (cached) return of({ label: cached, url: linkUrl });
        return this.api.getUserProfile(id).pipe(
          map(res => {
            const data = this.typeSafety.getProperty(res, 'data', {});
            const username = this.typeSafety.getProperty(data, 'username') ? `@${this.typeSafety.toString(this.typeSafety.getProperty(data, 'username'))}` : 'User';
            this.userLabelCache.set(id, username);
            return { label: username, url: linkUrl } as BreadcrumbItem;
          })
        );
      }
      if (bc?.type === 'order') {
        const id = seg.route.snapshot.paramMap.get('id') || '';
        if (!id) return of({ label: 'Order', url: linkUrl });
        const cached = this.orderLabelCache.get(id);
        if (cached) return of({ label: cached, url: linkUrl });
        return this.api.getOrder(id).pipe(
          map(res => {
            const data = this.typeSafety.getProperty(res, 'data', {});
            const raw = this.typeSafety.getProperty(data, 'id', id);
            const short = typeof raw === 'string' ? `#${raw.slice(-6)}` : `#${String(raw)}`;
            const label = `Order ${short}`;
            this.orderLabelCache.set(id, label);
            return { label, url: linkUrl } as BreadcrumbItem;
          })
        );
      }
      if (bc?.type === 'request') {
        const id = seg.route.snapshot.paramMap.get('id') || '';
        if (!id) return of({ label: 'Request', url: linkUrl });
        const cached = this.requestLabelCache.get(id);
        if (cached) return of({ label: cached, url: linkUrl });
        return this.api.getRequest(id).pipe(
          map(res => {
            const data = this.typeSafety.getProperty(res, 'data', {});
            const title = this.typeSafety.toString(this.typeSafety.getProperty(data, 'title'), 'Request');
            this.requestLabelCache.set(id, title);
            return { label: title, url: linkUrl } as BreadcrumbItem;
          })
        );
      }
      if (bc?.type === 'chat') {
        const id = seg.route.snapshot.paramMap.get('id') || '';
        if (!id) return of({ label: 'Conversation', url: linkUrl });
        const cached = this.chatLabelCache.get(id);
        if (cached) return of({ label: cached, url: linkUrl });
        return this.api.getChatRoom(id).pipe(
          map(res => {
            const data = this.typeSafety.getProperty(res, 'data', {});
            const other = this.typeSafety.toString(this.typeSafety.getProperty(data, 'other_user.username') || this.typeSafety.getProperty(data, 'name'), 'Conversation');
            this.chatLabelCache.set(id, other);
            return { label: other, url: linkUrl } as BreadcrumbItem;
          })
        );
      }
      if (bc?.type === 'post') {
        const id = seg.route.snapshot.paramMap.get('id') || '';
        if (!id) return of({ label: 'Post', url: linkUrl });
        const cached = this.postLabelCache.get(id);
        if (cached) return of({ label: cached, url: linkUrl });
        return this.api.getPost(id).pipe(
          map(res => {
            const data = this.typeSafety.getProperty(res, 'data', {});
            const raw = this.typeSafety.toString(this.typeSafety.getProperty(data, 'caption'), 'Post');
            const label = raw.length > 30 ? raw.slice(0, 30) + '…' : raw;
            this.postLabelCache.set(id, label);
            return { label, url: linkUrl } as BreadcrumbItem;
          })
        );
      }

      const routePath = seg.route.routeConfig?.path || '';
      const raw = routePath.split('/').filter(p => !p.startsWith(':')).pop() || '';
      const label = this.titleCase(raw || (seg.url ? seg.url.split('/').pop() || '' : ''));
      if (!label) return of(null);
      return of({ label, url: linkUrl });
    });

    return (itemObservables.length ? combineLatest(itemObservables) : of([])).pipe(
      map(items => items.filter(Boolean) as BreadcrumbItem[]),
      map(items => this.deduplicateConsecutive(items))
    );
  }

  private titleCase(s: string): string {
    if (!s) return '';
    return s.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }

  private deduplicateConsecutive(items: BreadcrumbItem[]): BreadcrumbItem[] {
    if (items.length < 2) return items;
    const result: BreadcrumbItem[] = [];
    for (const item of items) {
      if (!result.length || result[result.length - 1].label !== item.label) {
        result.push(item);
      }
    }
    return result;
  }
} 