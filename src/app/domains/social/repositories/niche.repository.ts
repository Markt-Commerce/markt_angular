import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiClientService } from '../../../core/infrastructure/http/api-client.service';
import type { PaginatedResponse } from '../../../core/infrastructure/http/api-response.types';
import {
  ModerationActionCreateDto,
  NicheCreateDto,
  NicheDto,
  NicheMembershipDto,
  NicheMembershipSearchResultDto,
  NicheModerationActionDto,
  NichePostApprovalDto,
  NichePostCreateDto,
  NichePostDto,
  NichePostListDto,
  NichePostResponseDto,
  NicheSearchParamsDto,
  NicheSearchResultDto,
  NicheUpdateDto,
} from '../models/post.dto';
import {
  Niche,
  NicheMembership,
  NicheModerationAction,
  NichePostSummary,
} from '../models/post.model';

@Injectable({
  providedIn: 'root',
})
export class NicheRepository {
  private apiClient = inject(ApiClientService);
  private readonly baseEndpoint = '/socials/niches';
  private readonly myNichesEndpoint = '/socials/my-niches';
  private readonly moderationEndpoint = '/socials/niches';

  private toDomain(dto: NicheDto): Niche {
    return Niche.fromDto(dto);
  }

  private toMembership(dto: NicheMembershipDto): NicheMembership {
    return NicheMembership.fromDto(dto);
  }

  private toNichePost(dto: NichePostDto): NichePostSummary {
    return NichePostSummary.fromDto(dto);
  }

  findPaginated(
    params?: NicheSearchParamsDto
  ): Observable<PaginatedResponse<Niche>> {
    return this.apiClient
      .get<NicheSearchResultDto>(
        this.baseEndpoint,
        this.toSearchQuery(params)
      )
      .pipe(map((response) => this.mapNicheResult(response.data)));
  }

  findMine(
    params?: NicheSearchParamsDto
  ): Observable<PaginatedResponse<Niche>> {
    return this.apiClient
      .get<NicheSearchResultDto>(
        this.myNichesEndpoint,
        this.toSearchQuery(params)
      )
      .pipe(map((response) => this.mapNicheResult(response.data)));
  }

  findById(id: string): Observable<Niche> {
    return this.apiClient
      .get<NicheDto>(`${this.baseEndpoint}/${id}`)
      .pipe(map((response) => this.toDomain(response.data)));
  }

  create(dto: NicheCreateDto): Observable<Niche> {
    return this.apiClient
      .post<NicheDto>(this.baseEndpoint, dto)
      .pipe(map((response) => this.toDomain(response.data)));
  }

  update(id: string, dto: NicheUpdateDto): Observable<Niche> {
    return this.apiClient
      .put<NicheDto>(`${this.baseEndpoint}/${id}`, dto)
      .pipe(map((response) => this.toDomain(response.data)));
  }

  join(id: string): Observable<NicheMembership> {
    return this.apiClient
      .post<NicheMembershipDto | { membership?: NicheMembershipDto }>(
        `${this.baseEndpoint}/${id}/join`
      )
      .pipe(
        map((response) => {
          const data = response.data;
          if (data && this.isNicheMembershipDto(data)) {
            return this.toMembership(data);
          }
          if (
            data &&
            typeof data === 'object' &&
            'membership' in data &&
            data.membership
          ) {
            return this.toMembership(data.membership);
          }
          throw new Error('Invalid niche membership payload received from API');
        })
      );
  }

  leave(id: string): Observable<void> {
    return this.apiClient
      .post<void>(`${this.baseEndpoint}/${id}/leave`)
      .pipe(map(() => undefined));
  }

  getMembers(
    id: string,
    params?: NicheSearchParamsDto
  ): Observable<PaginatedResponse<NicheMembership>> {
    return this.apiClient
      .get<NicheMembershipSearchResultDto>(
        `${this.baseEndpoint}/${id}/members`,
        this.toSearchQuery(params)
      )
      .pipe(map((response) => this.mapMembershipResult(response.data)));
  }

  getPosts(
    id: string,
    params?: NicheSearchParamsDto
  ): Observable<PaginatedResponse<NichePostSummary>> {
    return this.apiClient
      .get<NichePostListDto>(
        `${this.baseEndpoint}/${id}/posts`,
        this.toSearchQuery(params)
      )
      .pipe(map((response) => this.mapNichePostResult(response.data)));
  }

  createPost(id: string, dto: NichePostCreateDto): Observable<NichePostSummary> {
    return this.apiClient
      .post<NichePostResponseDto>(`${this.baseEndpoint}/${id}/posts`, dto)
      .pipe(
        map((response) => this.extractNichePost(response.data?.niche_post))
      );
  }

  approvePost(
    nichePostId: string,
    dto: NichePostApprovalDto
  ): Observable<NichePostSummary> {
    return this.apiClient
      .post<NichePostDto>(
        `${this.baseEndpoint}/posts/${nichePostId}/approve`,
        dto
      )
      .pipe(map((response) => this.toNichePost(response.data)));
  }

  moderate(
    nicheId: string,
    dto: ModerationActionCreateDto
  ): Observable<NicheModerationAction> {
    return this.apiClient
      .post<NicheModerationActionDto>(
        `${this.moderationEndpoint}/${nicheId}/moderate`,
        dto
      )
      .pipe(
        map((response) => NicheModerationAction.fromDto(response.data))
      );
  }

  private mapNicheResult(
    data: NicheSearchResultDto | null | undefined
  ): PaginatedResponse<Niche> {
    if (!data) {
      return {
        items: [],
        pagination: {
          page: 1,
          per_page: 0,
          total_items: 0,
          total_pages: 0,
          first_page: 1,
          last_page: 1,
          previous_page: null,
          next_page: null,
          has_next: false,
          has_prev: false,
        },
      };
    }

    return {
      items: (data.items ?? []).map((dto) => this.toDomain(dto)),
      pagination: data.pagination,
    };
  }

  private mapMembershipResult(
    data: NicheMembershipSearchResultDto | null | undefined
  ): PaginatedResponse<NicheMembership> {
    if (!data) {
      return {
        items: [],
        pagination: {
          page: 1,
          per_page: 0,
          total_items: 0,
          total_pages: 0,
          first_page: 1,
          last_page: 1,
          previous_page: null,
          next_page: null,
          has_next: false,
          has_prev: false,
        },
      };
    }

    return {
      items: (data.items ?? []).map((dto) => this.toMembership(dto)),
      pagination: data.pagination,
    };
  }

  private mapNichePostResult(
    data: NichePostListDto | null | undefined
  ): PaginatedResponse<NichePostSummary> {
    if (!data) {
      return {
        items: [],
        pagination: {
          page: 1,
          per_page: 0,
          total_items: 0,
          total_pages: 0,
          first_page: 1,
          last_page: 1,
          previous_page: null,
          next_page: null,
          has_next: false,
          has_prev: false,
        },
      };
    }

    return {
      items: (data.items ?? []).map((dto) => this.toNichePost(dto)),
      pagination: data.pagination,
    };
  }

  private isNicheMembershipDto(
    payload: unknown
  ): payload is NicheMembershipDto {
    if (!payload || typeof payload !== 'object') {
      return false;
    }

    const record = payload as Record<string, unknown>;
    return (
      typeof record['id'] === 'number' &&
      typeof record['niche_id'] === 'string' &&
      typeof record['user_id'] === 'string'
    );
  }

  private toSearchQuery(
    params?: NicheSearchParamsDto
  ): Record<string, unknown> | undefined {
    if (!params) {
      return undefined;
    }

    const query: Record<string, unknown> = {};
    if (params.search) {
      query['search'] = params.search;
    }
    if (params.category_ids?.length) {
      query['category_ids'] = params.category_ids;
    }
    if (params.visibility) {
      query['visibility'] = params.visibility;
    }
    if (params.page !== undefined) {
      query['page'] = params.page;
    }
    if (params.per_page !== undefined) {
      query['per_page'] = params.per_page;
    }

    return query;
  }

  private extractNichePost(dto?: NichePostDto | null): NichePostSummary {
    if (!dto) {
      throw new Error('Invalid niche post payload received from API');
    }
    return this.toNichePost(dto);
  }
}

