/**
 * Request Repository
 */

import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiClientService } from '../../../core/infrastructure/http/api-client.service';
import {
  BuyerRequestCreateDto,
  BuyerRequestDto,
  BuyerRequestSearchParamsDto,
  BuyerRequestSearchResultDto,
  BuyerRequestUpdateDto,
  RequestStatisticsDto,
  RequestUpvoteResponseDto,
  SellerOfferCreateDto,
  SellerOfferDto,
  StatusUpdateDto,
} from '../models/request.dto';
import { BuyerRequest, SellerOffer } from '../models/request.model';
import type { PaginatedResponse } from '../../../core/infrastructure/http/api-response.types';

@Injectable({
  providedIn: 'root',
})
export class RequestRepository {
  private apiClient = inject(ApiClientService);
  private readonly baseEndpoint = '/requests';

  private toDomain(dto: BuyerRequestDto): BuyerRequest {
    return BuyerRequest.fromDto(dto);
  }

  private offerToDomain(dto: SellerOfferDto): SellerOffer {
    return SellerOffer.fromDto(dto);
  }

  findPaginated(
    params?: BuyerRequestSearchParamsDto
  ): Observable<PaginatedResponse<BuyerRequest>> {
    return this.apiClient
      .get<BuyerRequestSearchResultDto>(
        this.baseEndpoint,
        this.toQueryParams(params)
      )
      .pipe(
        map((response) => ({
          items: (response.data.items ?? []).map((dto) => this.toDomain(dto)),
          pagination: response.data.pagination,
        }))
    );
  }

  findAll(params?: BuyerRequestSearchParamsDto): Observable<BuyerRequest[]> {
    return this.findPaginated(params).pipe(map((result) => result.items));
  }

  findById(id: string): Observable<BuyerRequest> {
    return this.apiClient
      .get<BuyerRequestDto>(`${this.baseEndpoint}/${id}`)
      .pipe(map((response) => this.toDomain(response.data)));
  }

  create(dto: BuyerRequestCreateDto): Observable<BuyerRequest> {
    return this.apiClient
      .post<BuyerRequestDto>(this.baseEndpoint, dto)
      .pipe(map((response) => this.toDomain(response.data)));
  }

  update(id: string, dto: BuyerRequestUpdateDto): Observable<BuyerRequest> {
    return this.apiClient
      .put<BuyerRequestDto>(`${this.baseEndpoint}/${id}`, dto)
      .pipe(map((response) => this.toDomain(response.data)));
  }

  delete(id: string): Observable<void> {
    return this.apiClient
      .delete<void>(`${this.baseEndpoint}/${id}`)
      .pipe(map(() => undefined));
  }

  updateStatus(id: string, dto: StatusUpdateDto): Observable<BuyerRequest> {
    return this.apiClient
      .put<BuyerRequestDto>(`${this.baseEndpoint}/${id}/status`, dto)
      .pipe(map((response) => this.toDomain(response.data)));
  }

  upvote(id: string): Observable<RequestUpvoteResponseDto> {
    return this.apiClient
      .post<RequestUpvoteResponseDto>(`${this.baseEndpoint}/${id}/upvote`)
      .pipe(map((response) => response.data));
  }

  getOffers(requestId: string): Observable<SellerOffer[]> {
    return this.apiClient
      .get<SellerOfferDto[]>(`${this.baseEndpoint}/${requestId}/offers`)
      .pipe(
        map((response) =>
          (response.data ?? []).map((dto) => this.offerToDomain(dto))
        )
    );
  }

  createOffer(
    requestId: string,
    dto: SellerOfferCreateDto
  ): Observable<SellerOffer> {
    return this.apiClient
      .post<SellerOfferDto>(`${this.baseEndpoint}/${requestId}/offers`, dto)
      .pipe(map((response) => this.offerToDomain(response.data)));
  }

  acceptOffer(offerId: string): Observable<SellerOffer> {
    return this.apiClient
      .post<SellerOfferDto>(`${this.baseEndpoint}/offers/${offerId}/accept`)
      .pipe(map((response) => this.offerToDomain(response.data)));
  }

  rejectOffer(offerId: string): Observable<SellerOffer> {
    return this.apiClient
      .post<SellerOfferDto>(`${this.baseEndpoint}/offers/${offerId}/reject`)
      .pipe(map((response) => this.offerToDomain(response.data)));
  }

  withdrawOffer(offerId: string): Observable<SellerOffer> {
    return this.apiClient
      .post<SellerOfferDto>(`${this.baseEndpoint}/offers/${offerId}/withdraw`)
      .pipe(map((response) => this.offerToDomain(response.data)));
  }

  getStatistics(): Observable<RequestStatisticsDto> {
    return this.apiClient
      .get<RequestStatisticsDto>(`${this.baseEndpoint}/statistics`)
      .pipe(map((response) => response.data));
  }

  private toQueryParams(
    params?: BuyerRequestSearchParamsDto
  ): Record<string, unknown> | undefined {
    if (!params) {
      return undefined;
  }
    const query: Record<string, unknown> = {};

    if (params.page !== undefined) {
      query['page'] = params.page;
    }
    if (params.per_page !== undefined) {
      query['per_page'] = params.per_page;
    }
    if (params.search) {
      query['search'] = params.search;
    }
    if (params.category_ids?.length) {
      query['category_ids'] = params.category_ids;
    }
    if (params.min_budget !== undefined) {
      query['min_budget'] = params.min_budget;
    }
    if (params.max_budget !== undefined) {
      query['max_budget'] = params.max_budget;
    }
    if (params.status) {
      query['status'] = params.status;
    }
    if (params.sort_by) {
      query['sort_by'] = params.sort_by;
    }
    if (params.sort_order) {
      query['sort_order'] = params.sort_order;
    }

    return query;
  }
}
