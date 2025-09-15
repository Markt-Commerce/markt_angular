import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError, throwError } from 'rxjs';

export interface NicheCommunity {
  id: string;
  name: string;
  description: string;
  visibility: 'public' | 'private' | 'restricted';
  allow_buyer_posts: boolean;
  allow_seller_posts: boolean;
  require_approval: boolean;
  max_members: number;
  member_count: number;
  rules: string[];
  tags: string[];
  settings: Record<string, any>;
  created_at: string;
  updated_at: string;
  category: {
    id: number;
    name: string;
    description: string;
    slug: string;
    image_url?: string;
    is_active: boolean;
    parent_id?: number;
  };
  categories: Array<{
    id: number;
    name: string;
    description: string;
    slug: string;
    image_url?: string;
    is_active: boolean;
    parent_id?: number;
  }>;
  owner: {
    id: string;
    username: string;
    profile_picture_url?: string;
  };
  is_member?: boolean;
  is_owner?: boolean;
  is_moderator?: boolean;
}

export interface NicheMember {
  id: number;
  user_id: string;
  niche_id: string;
  role: 'member' | 'moderator' | 'owner';
  invited_by?: string;
  post_count: number;
  last_activity: string;
  joined_at: string;
  user: {
    id: string;
    username: string;
    profile_picture_url?: string;
  };
  inviter?: {
    id: string;
    username: string;
    profile_picture_url?: string;
  };
  niche: NicheCommunity;
}

export interface CreateNicheRequest {
  name: string;
  description: string;
  visibility: 'public' | 'private' | 'restricted';
  category_ids: number[];
  tags: string[];
  allow_buyer_posts: boolean;
  allow_seller_posts: boolean;
  require_approval: boolean;
  max_members: number;
  rules: string[];
  settings: Record<string, any>;
}

export interface UpdateNicheRequest {
  name?: string;
  description?: string;
  visibility?: 'public' | 'private' | 'restricted';
  category_ids?: number[];
  tags?: string[];
  allow_buyer_posts?: boolean;
  allow_seller_posts?: boolean;
  require_approval?: boolean;
  max_members?: number;
  rules?: string[];
  settings?: Record<string, any>;
}

export interface ModerationAction {
  action_type: 'ban' | 'mute' | 'warn' | 'kick' | 'timeout';
  target_type: 'user' | 'post' | 'comment';
  target_id: string;
  target_user_id?: string;
  reason: string;
  duration?: number; // in minutes
  banned_until?: string;
}

export interface NicheFilters {
  search?: string;
  page?: number;
  per_page?: number;
  category_ids?: number[];
  visibility?: 'public' | 'private' | 'restricted';
  sort?: string;
  filters?: string;
}

@Injectable({
  providedIn: 'root'
})
export class NicheService {
  private http = inject(HttpClient);
  private readonly API_BASE_URL = 'https://test.api.marktcommerce.com/api/v1';

  // State management
  private nichesSubject = new BehaviorSubject<NicheCommunity[]>([]);
  public niches$ = this.nichesSubject.asObservable();

  private myNichesSubject = new BehaviorSubject<NicheMember[]>([]);
  public myNiches$ = this.myNichesSubject.asObservable();

  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  constructor() {}

  /**
   * Search and list niche communities
   */
  searchNiches(filters: NicheFilters = {}): Observable<{
    items: NicheCommunity[];
    pagination: {
      page: number;
      per_page: number;
      total_pages: number;
      total_items: number;
    };
  }> {
    this.loadingSubject.next(true);
    
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.per_page) params.append('per_page', filters.per_page.toString());
    if (filters.visibility) params.append('visibility', filters.visibility);
    if (filters.category_ids?.length) {
      filters.category_ids.forEach(id => params.append('category_ids', id.toString()));
    }
    if (filters.sort) params.append('sort', filters.sort);
    if (filters.filters) params.append('filters', filters.filters);

    return this.http.get<{
      items: NicheCommunity[];
      pagination: any;
    }>(`${this.API_BASE_URL}/socials/niches?${params.toString()}`).pipe(
      tap(response => {
        this.nichesSubject.next(response.items);
        this.loadingSubject.next(false);
      }),
      catchError(error => {
        this.loadingSubject.next(false);
        console.error('Error fetching niches:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Create new niche community (sellers only)
   */
  createNiche(nicheData: CreateNicheRequest): Observable<NicheCommunity> {
    return this.http.post<NicheCommunity>(`${this.API_BASE_URL}/socials/niches`, nicheData).pipe(
      tap(newNiche => {
        const currentNiches = this.nichesSubject.value;
        this.nichesSubject.next([newNiche, ...currentNiches]);
      }),
      catchError(error => {
        console.error('Error creating niche:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get niche details with access control
   */
  getNiche(nicheId: string): Observable<NicheCommunity> {
    return this.http.get<NicheCommunity>(`${this.API_BASE_URL}/socials/niches/${nicheId}`).pipe(
      catchError(error => {
        console.error('Error fetching niche details:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Update niche (owner only)
   */
  updateNiche(nicheId: string, updateData: UpdateNicheRequest): Observable<NicheCommunity> {
    return this.http.put<NicheCommunity>(`${this.API_BASE_URL}/socials/niches/${nicheId}`, updateData).pipe(
      tap(updatedNiche => {
        const currentNiches = this.nichesSubject.value;
        const index = currentNiches.findIndex(n => n.id === nicheId);
        if (index !== -1) {
          currentNiches[index] = updatedNiche;
          this.nichesSubject.next([...currentNiches]);
        }
      }),
      catchError(error => {
        console.error('Error updating niche:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Join a niche community
   */
  joinNiche(nicheId: string): Observable<NicheMember> {
    return this.http.post<NicheMember>(`${this.API_BASE_URL}/socials/niches/${nicheId}/join`, {}).pipe(
      tap(membership => {
        const currentMyNiches = this.myNichesSubject.value;
        this.myNichesSubject.next([membership, ...currentMyNiches]);
        
        // Update member count in niches list
        const currentNiches = this.nichesSubject.value;
        const index = currentNiches.findIndex(n => n.id === nicheId);
        if (index !== -1) {
          currentNiches[index].member_count += 1;
          currentNiches[index].is_member = true;
          this.nichesSubject.next([...currentNiches]);
        }
      }),
      catchError(error => {
        console.error('Error joining niche:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Leave a niche community
   */
  leaveNiche(nicheId: string): Observable<void> {
    return this.http.post<void>(`${this.API_BASE_URL}/socials/niches/${nicheId}/leave`, {}).pipe(
      tap(() => {
        const currentMyNiches = this.myNichesSubject.value;
        this.myNichesSubject.next(currentMyNiches.filter(m => m.niche_id !== nicheId));
        
        // Update member count in niches list
        const currentNiches = this.nichesSubject.value;
        const index = currentNiches.findIndex(n => n.id === nicheId);
        if (index !== -1) {
          currentNiches[index].member_count -= 1;
          currentNiches[index].is_member = false;
          this.nichesSubject.next([...currentNiches]);
        }
      }),
      catchError(error => {
        console.error('Error leaving niche:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get niche members with role filtering
   */
  getNicheMembers(nicheId: string, filters: NicheFilters = {}): Observable<{
    items: NicheMember[];
    pagination: any;
  }> {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.per_page) params.append('per_page', filters.per_page.toString());
    if (filters.sort) params.append('sort', filters.sort);
    if (filters.filters) params.append('filters', filters.filters);

    return this.http.get<{
      items: NicheMember[];
      pagination: any;
    }>(`${this.API_BASE_URL}/socials/niches/${nicheId}/members?${params.toString()}`).pipe(
      catchError(error => {
        console.error('Error fetching niche members:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Perform moderation action (moderators only)
   */
  moderateNiche(nicheId: string, action: ModerationAction): Observable<{
    id: number;
    niche_id: string;
    moderator_id: string;
    action_type: string;
    target_type: string;
    target_id: string;
    target_user_id?: string;
    reason: string;
    duration?: number;
    expires_at?: string;
    is_active: boolean;
    created_at: string;
    moderator: {
      id: string;
      username: string;
      profile_picture_url?: string;
    };
    target_user?: {
      id: string;
      username: string;
      profile_picture_url?: string;
    };
  }> {
    return this.http.post<{
      id: number;
      niche_id: string;
      moderator_id: string;
      action_type: string;
      target_type: string;
      target_id: string;
      target_user_id?: string;
      reason: string;
      duration?: number;
      expires_at?: string;
      is_active: boolean;
      created_at: string;
      moderator: {
        id: string;
        username: string;
        profile_picture_url?: string;
      };
      target_user?: {
        id: string;
        username: string;
        profile_picture_url?: string;
      };
    }>(`${this.API_BASE_URL}/socials/niches/${nicheId}/moderate`, action).pipe(
      catchError(error => {
        console.error('Error performing moderation action:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get current user's niche memberships
   */
  getMyNiches(filters: NicheFilters = {}): Observable<{
    items: NicheMember[];
    pagination: any;
  }> {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.per_page) params.append('per_page', filters.per_page.toString());
    if (filters.sort) params.append('sort', filters.sort);
    if (filters.filters) params.append('filters', filters.filters);

    return this.http.get<{
      items: NicheMember[];
      pagination: any;
    }>(`${this.API_BASE_URL}/socials/my-niches?${params.toString()}`).pipe(
      tap(response => {
        this.myNichesSubject.next(response.items);
      }),
      catchError(error => {
        console.error('Error fetching my niches:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Check if user can post in niche
   */
  canPostInNiche(nicheId: string): Observable<{
    can_post: boolean;
    reason?: string;
    restrictions?: string[];
  }> {
    return this.http.get<{
      can_post: boolean;
      reason?: string;
      restrictions?: string[];
    }>(`${this.API_BASE_URL}/socials/niches/${nicheId}/can-post`).pipe(
      catchError(error => {
        console.error('Error checking post permissions:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get niche visibility display text
   */
  getVisibilityText(visibility: string): string {
    switch (visibility) {
      case 'public':
        return 'Public - Anyone can join';
      case 'private':
        return 'Private - Invitation only';
      case 'restricted':
        return 'Restricted - Approval required';
      default:
        return 'Unknown';
    }
  }

  /**
   * Get role display text
   */
  getRoleText(role: string): string {
    switch (role) {
      case 'owner':
        return 'Owner';
      case 'moderator':
        return 'Moderator';
      case 'member':
        return 'Member';
      default:
        return 'Unknown';
    }
  }

  /**
   * Get role badge color
   */
  getRoleBadgeColor(role: string): string {
    switch (role) {
      case 'owner':
        return 'bg-purple-100 text-purple-800';
      case 'moderator':
        return 'bg-blue-100 text-blue-800';
      case 'member':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }
} 