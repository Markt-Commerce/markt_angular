/**
 * Request Domain Service
 */

import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { RequestRepository } from '../repositories/request.repository';
import { BuyerRequest, SellerOffer } from '../models/request.model';
import { BuyerRequestCreateDto, SellerOfferCreateDto } from '../models/request.dto';

@Injectable({
  providedIn: 'root'
})
export class RequestService {
  private requestRepository = inject(RequestRepository);

  getRequests(params?: Record<string, unknown>): Observable<BuyerRequest[]> {
    return this.requestRepository.findAll(params);
  }

  getRequest(id: string): Observable<BuyerRequest> {
    return this.requestRepository.findById(id);
  }

  createRequest(data: BuyerRequestCreateDto): Observable<BuyerRequest> {
    if (!data.title || data.title.trim().length === 0) {
      throw new Error('Request title is required');
    }

    if (!data.description || data.description.trim().length === 0) {
      throw new Error('Request description is required');
    }

    if (!data.category_ids || data.category_ids.length === 0) {
      throw new Error('At least one category is required');
    }

    if (data.budget && data.budget <= 0) {
      throw new Error('Budget must be greater than 0');
    }

    return this.requestRepository.create(data);
  }

  createOffer(requestId: string, data: SellerOfferCreateDto): Observable<SellerOffer> {
    if (data.price <= 0) {
      throw new Error('Offer price must be greater than 0');
    }

    if (!data.message || data.message.trim().length === 0) {
      throw new Error('Offer message is required');
    }

    return this.requestRepository.createOffer(requestId, data);
  }
}

