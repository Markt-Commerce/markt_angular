/**
 * Request Repository
 */

import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiClientService } from '../../../core/infrastructure/http/api-client.service';
import { BuyerRequest, SellerOffer } from '../models/request.model';
import { BuyerRequestDto, BuyerRequestCreateDto, SellerOfferDto, SellerOfferCreateDto, BuyerRequestUpdateDto, StatusUpdateDto, RequestStatisticsDto } from '../models/request.dto';

@Injectable({
  providedIn: 'root'
})
export class RequestRepository {
  private apiClient = inject(ApiClientService);
  private readonly baseEndpoint = '/api/v1/requests';

  private toDomain(dto: BuyerRequestDto): BuyerRequest {
    return new BuyerRequest(
      dto.id,
      dto.user_id,
      dto.title,
      dto.description,
      dto.budget,
      dto.expires_at,
      dto.status,
      dto.category_ids,
      dto.views,
      dto.upvotes,
      dto.created_at,
      dto.updated_at
    );
  }

  private offerToDomain(dto: SellerOfferDto): SellerOffer {
    return new SellerOffer(
      dto.id,
      dto.request_id,
      dto.seller_id,
      dto.price,
      dto.message,
      dto.status,
      dto.created_at
    );
  }

  findAll(params?: Record<string, unknown>): Observable<BuyerRequest[]> {
    return this.apiClient.get<BuyerRequestDto[]>(this.baseEndpoint, params).pipe(
      map(response => response.data.map(dto => this.toDomain(dto)))
    );
  }

  findById(id: string): Observable<BuyerRequest> {
    return this.apiClient.get<BuyerRequestDto>(`${this.baseEndpoint}/${id}`).pipe(
      map(response => this.toDomain(response.data))
    );
  }

  create(data: BuyerRequestCreateDto): Observable<BuyerRequest> {
    return this.apiClient.post<BuyerRequestDto>(this.baseEndpoint, data).pipe(
      map(response => this.toDomain(response.data))
    );
  }

  createOffer(requestId: string, data: SellerOfferCreateDto): Observable<SellerOffer> {
    return this.apiClient.post<SellerOfferDto>(`${this.baseEndpoint}/${requestId}/offers`, data).pipe(
      map(response => this.offerToDomain(response.data))
    );
  }

  update(id: string, data: BuyerRequestUpdateDto): Observable<BuyerRequest> {
    return this.apiClient.put<BuyerRequestDto>(`${this.baseEndpoint}/${id}`, data).pipe(
      map(response => this.toDomain(response.data))
    );
  }

  delete(id: string): Observable<void> {
    return this.apiClient.delete<void>(`${this.baseEndpoint}/${id}`).pipe(
      map(() => void 0)
    );
  }

  updateStatus(id: string, data: StatusUpdateDto): Observable<BuyerRequest> {
    return this.apiClient.put<BuyerRequestDto>(`${this.baseEndpoint}/${id}/status`, data).pipe(
      map(response => this.toDomain(response.data))
    );
  }

  upvote(id: string): Observable<{ success: boolean; new_count: number }> {
    return this.apiClient.post<{ success: boolean; new_count: number }>(`${this.baseEndpoint}/${id}/upvote`).pipe(
      map(response => response.data)
    );
  }

  getOffers(requestId: string): Observable<SellerOffer[]> {
    return this.apiClient.get<SellerOfferDto[]>(`${this.baseEndpoint}/${requestId}/offers`).pipe(
      map(response => response.data.map(dto => this.offerToDomain(dto)))
    );
  }

  acceptOffer(offerId: string): Observable<SellerOffer> {
    return this.apiClient.post<SellerOfferDto>(`${this.baseEndpoint}/offers/${offerId}/accept`).pipe(
      map(response => this.offerToDomain(response.data))
    );
  }

  rejectOffer(offerId: string): Observable<SellerOffer> {
    return this.apiClient.post<SellerOfferDto>(`${this.baseEndpoint}/offers/${offerId}/reject`).pipe(
      map(response => this.offerToDomain(response.data))
    );
  }

  withdrawOffer(offerId: string): Observable<SellerOffer> {
    return this.apiClient.post<SellerOfferDto>(`${this.baseEndpoint}/offers/${offerId}/withdraw`).pipe(
      map(response => this.offerToDomain(response.data))
        );
  }

  getStatistics(): Observable<RequestStatisticsDto> {
    return this.apiClient.get<RequestStatisticsDto>(`${this.baseEndpoint}/statistics`).pipe(
      map(response => response.data)
    );
  }
}

