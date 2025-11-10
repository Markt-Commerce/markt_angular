/**
 * Request Domain Service
 */

import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService, RequestData, OfferData, StatusUpdateData } from '../../../core/services/api.service';
import { RequestRepository } from '../repositories/request.repository';
import { BuyerRequest, SellerOffer } from '../models/request.model';
import { BuyerRequestCreateDto, SellerOfferCreateDto, BuyerRequestUpdateDto, RequestStatisticsDto } from '../models/request.dto';

@Injectable({
  providedIn: 'root'
})
export class RequestService {
  private requestRepository = inject(RequestRepository);
  private apiService = inject(ApiService);

  getRequests(params?: Record<string, unknown>): Observable<any> {
    return this.apiService.getRequests(params);
  }

  getRequest(id: string): Observable<any> {
    return this.apiService.getRequest(id);
  }

  createRequest(data: BuyerRequestCreateDto): Observable<any> {
    return this.apiService.createRequest(data as RequestData);
  }

  createOffer(requestId: string, data: SellerOfferCreateDto): Observable<SellerOffer> {
    return this.requestRepository.createOffer(requestId, data);
  }

  addOffer(requestId: string, data: SellerOfferCreateDto): Observable<any> {
    return this.apiService.createOffer(requestId, data as OfferData);
  }

  getRequestOffers(requestId: string): Observable<any> {
    return this.apiService.getRequestOffers(requestId);
  }

  acceptOffer(offerId: string): Observable<any> {
    return this.apiService.acceptOffer(offerId);
  }

  rejectOffer(offerId: string): Observable<any> {
    return this.apiService.rejectOffer(offerId);
  }

  withdrawOffer(offerId: string): Observable<any> {
    return this.apiService.withdrawOffer(offerId);
  }

  updateRequest(id: string, data: BuyerRequestUpdateDto): Observable<any> {
    return this.apiService.updateRequest(id, data as RequestData);
  }

  updateRequestStatus(id: string, data: StatusUpdateData): Observable<any> {
    return this.apiService.updateRequestStatus(id, data);
  }

  deleteRequest(id: string): Observable<any> {
    return this.apiService.deleteRequest(id);
  }

  upvoteRequest(id: string): Observable<any> {
    return this.apiService.upvoteRequest(id);
  }

  getRequestStatistics(): Observable<RequestStatisticsDto> {
    return this.requestRepository.getStatistics();
  }
}

