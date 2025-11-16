import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiClientService } from '../../../core/infrastructure/http/api-client.service';
import type { PaginatedResponse } from '../../../core/infrastructure/http/api-response.types';
import {
  FollowDto,
  FollowListDto,
  FollowSearchParamsDto,
} from '../models/post.dto';
import { Follow } from '../models/post.model';

@Injectable({
  providedIn: 'root',
})
export class FollowRepository {
  private apiClient = inject(ApiClientService);
  private readonly followEndpoint = '/socials/follow';
  private readonly followersEndpoint = '/socials/followers';
  private readonly followingEndpoint = '/socials/following';

  private toDomain(dto: FollowDto): Follow {
    return Follow.fromDto(dto);
  }

  follow(userId: string): Observable<Follow> {
    return this.apiClient
      .post<FollowDto | { follow?: FollowDto }>(
        `${this.followEndpoint}/${userId}`
      )
      .pipe(
        map((response) => {
          const data = response.data;
          if (data && this.isFollowDto(data)) {
            return this.toDomain(data);
          }
          if (
            data &&
            typeof data === 'object' &&
            'follow' in data &&
            data.follow
          ) {
            return this.toDomain(data.follow);
          }
          throw new Error('Invalid follow payload received from API');
        })
      );
  }

  unfollow(userId: string): Observable<void> {
    return this.apiClient
      .delete<void>(`${this.followEndpoint}/${userId}`)
      .pipe(map(() => undefined));
  }

  getFollowers(
    userId: string,
    params?: FollowSearchParamsDto
  ): Observable<PaginatedResponse<Follow>> {
    return this.apiClient
      .get<FollowListDto>(
        this.followersEndpoint,
        this.toQueryParams(userId, params)
      )
      .pipe(map((response) => this.mapFollowList(response.data)));
  }

  getFollowing(
    userId: string,
    params?: FollowSearchParamsDto
  ): Observable<PaginatedResponse<Follow>> {
    return this.apiClient
      .get<FollowListDto>(
        this.followingEndpoint,
        this.toQueryParams(userId, params)
      )
      .pipe(map((response) => this.mapFollowList(response.data)));
  }

  private mapFollowList(
    data: FollowListDto | null | undefined
  ): PaginatedResponse<Follow> {
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

  private isFollowDto(payload: unknown): payload is FollowDto {
    if (!payload || typeof payload !== 'object') {
      return false;
    }

    const record = payload as Record<string, unknown>;
    return (
      typeof record['follower_id'] === 'string' &&
      typeof record['followee_id'] === 'string' &&
      typeof record['created_at'] === 'string'
    );
  }

  private toQueryParams(
    userId: string,
    params?: FollowSearchParamsDto
  ): Record<string, unknown> {
    const query: Record<string, unknown> = {
      user_id: userId,
    };

    if (!params) {
      return query;
    }

    if (params.page !== undefined) {
      query['page'] = params.page;
    }
    if (params.per_page !== undefined) {
      query['per_page'] = params.per_page;
    }
    if (params.type) {
      query['type'] = params.type;
    }

    return query;
  }
}

