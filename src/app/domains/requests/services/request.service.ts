/**
 * Request Domain Service
 */

import { Injectable, inject, signal } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, finalize, map, tap } from 'rxjs/operators';
import { RequestRepository } from '../repositories/request.repository';
import {
  BuyerRequestCreateDto,
  BuyerRequestSearchParamsDto,
  BuyerRequestUpdateDto,
  RequestStatisticsDto,
  SellerOfferCreateDto,
  StatusUpdateDto,
} from '../models/request.dto';
import { BuyerRequest, SellerOffer } from '../models/request.model';
import type { PaginatedResponse } from '../../../core/infrastructure/http/api-response.types';

@Injectable({
  providedIn: 'root',
})
export class RequestService {
  private requestRepository = inject(RequestRepository);
  private readonly requestsSignal =
    signal<PaginatedResponse<BuyerRequest> | null>(null);
  private readonly selectedRequestSignal = signal<BuyerRequest | null>(null);
  private readonly offersStateSignal = signal<{
    requestId: string | null;
    items: SellerOffer[];
    isLoading: boolean;
  }>({ requestId: null, items: [], isLoading: false });
  private readonly statisticsSignal = signal<RequestStatisticsDto | null>(null);
  private readonly loadingSignal = signal<boolean>(false);
  private readonly errorSignal = signal<string | null>(null);

  readonly requests$ = this.requestsSignal.asReadonly();
  readonly selectedRequest$ = this.selectedRequestSignal.asReadonly();
  readonly offersState$ = this.offersStateSignal.asReadonly();
  readonly statistics$ = this.statisticsSignal.asReadonly();
  readonly isLoading$ = this.loadingSignal.asReadonly();
  readonly error$ = this.errorSignal.asReadonly();

  loadRequests(
    params?: BuyerRequestSearchParamsDto
  ): Observable<PaginatedResponse<BuyerRequest>> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    return this.requestRepository.findPaginated(params).pipe(
      tap((result) => this.requestsSignal.set(result)),
      catchError((error) => this.handleError(error)),
      finalize(() => this.loadingSignal.set(false))
    );
  }

  getRequestsSnapshot(): PaginatedResponse<BuyerRequest> | null {
    return this.requestsSignal();
  }

  getRequest(id: string): Observable<BuyerRequest> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    return this.requestRepository.findById(id).pipe(
      tap((request) => {
        this.selectedRequestSignal.set(request);
        this.mergeRequestIntoCollection(request);
      }),
      catchError((error) => this.handleError(error)),
      finalize(() => this.loadingSignal.set(false))
    );
  }

  createRequest(dto: BuyerRequestCreateDto): Observable<BuyerRequest> {
    return this.requestRepository.create(dto).pipe(
      tap((created) => {
        const snapshot = this.requestsSignal();
        if (!snapshot) {
          return;
        }
        this.requestsSignal.set({
          ...snapshot,
          items: [created, ...snapshot.items],
          pagination: snapshot.pagination
            ? {
                ...snapshot.pagination,
                total_items: snapshot.pagination.total_items + 1,
              }
            : snapshot.pagination,
        });
        this.selectedRequestSignal.set(created);
      })
    );
  }

  updateRequest(
    id: string,
    dto: BuyerRequestUpdateDto
  ): Observable<BuyerRequest> {
    return this.requestRepository.update(id, dto).pipe(
      tap((updated) => {
        const snapshot = this.requestsSignal();
        if (!snapshot) {
          return;
        }
        this.requestsSignal.set({
          ...snapshot,
          items: snapshot.items.map((item) =>
            item.id === updated.id ? updated : item
          ),
        });
        if (this.selectedRequestSignal()?.id === updated.id) {
          this.selectedRequestSignal.set(updated);
        }
      })
    );
  }

  deleteRequest(id: string): Observable<void> {
    return this.requestRepository.delete(id).pipe(
      tap(() => {
        const snapshot = this.requestsSignal();
        if (!snapshot) {
          return;
        }
        this.requestsSignal.set({
          ...snapshot,
          items: snapshot.items.filter((item) => item.id !== id),
          pagination: snapshot.pagination
            ? {
                ...snapshot.pagination,
                total_items: Math.max(snapshot.pagination.total_items - 1, 0),
              }
            : snapshot.pagination,
        });
        if (this.selectedRequestSignal()?.id === id) {
          this.selectedRequestSignal.set(null);
        }
      })
    );
  }

  updateRequestStatus(
    id: string,
    dto: StatusUpdateDto
  ): Observable<BuyerRequest> {
    return this.requestRepository.updateStatus(id, dto).pipe(
      tap((updated) => {
        const snapshot = this.requestsSignal();
        if (!snapshot) {
          return;
        }
        this.requestsSignal.set({
          ...snapshot,
          items: snapshot.items.map((item) =>
            item.id === updated.id ? updated : item
          ),
        });
        if (this.selectedRequestSignal()?.id === updated.id) {
          this.selectedRequestSignal.set(updated);
        }
      })
    );
  }

  upvoteRequest(id: string): Observable<BuyerRequest> {
    let updated: BuyerRequest | null = null;
    return this.requestRepository.upvote(id).pipe(
      map((response) => response.upvotes),
      tap((upvotes) => {
        const snapshot = this.requestsSignal();
        if (!snapshot) {
          return;
        }
        const nextItems = snapshot.items.map((item) => {
          if (item.id !== id) {
            return item;
          }
          updated = item.withUpdatedUpvotes(upvotes);
          return updated;
        });
        this.requestsSignal.set({
          ...snapshot,
          items: nextItems,
        });
      }),
      map(() => {
        if (updated) {
          return updated;
        }
        // Fallback: attempt to read current snapshot or throw
        const snapshot = this.requestsSignal();
        const found = snapshot?.items.find((item) => item.id === id);
        if (!found) {
          throw new Error('Request not found after upvote');
        }
        return found;
      })
    );
  }

  getRequestOffers(requestId: string): Observable<SellerOffer[]> {
    this.setOffersLoading(requestId, true);
    return this.requestRepository.getOffers(requestId).pipe(
      tap((offers) => {
        this.offersStateSignal.set({
          requestId,
          items: offers,
          isLoading: false,
        });
        this.updateRequestOffersInCollection(requestId, offers);
      }),
      catchError((error) => this.handleOffersError(error, requestId)),
      finalize(() => this.setOffersLoading(requestId, false))
    );
  }

  createOffer(
    requestId: string,
    dto: SellerOfferCreateDto
  ): Observable<SellerOffer> {
    return this.requestRepository.createOffer(requestId, dto).pipe(
      tap((offer) => {
        this.appendOfferToState(requestId, offer);
      })
    );
  }

  addOffer(
    requestId: string,
    dto: SellerOfferCreateDto
  ): Observable<SellerOffer> {
    return this.createOffer(requestId, dto);
  }

  acceptOffer(offerId: string): Observable<SellerOffer> {
    return this.requestRepository
      .acceptOffer(offerId)
      .pipe(tap((offer) => this.replaceOfferInState(offer)));
  }

  rejectOffer(offerId: string): Observable<SellerOffer> {
    return this.requestRepository
      .rejectOffer(offerId)
      .pipe(tap((offer) => this.replaceOfferInState(offer)));
  }

  withdrawOffer(offerId: string): Observable<SellerOffer> {
    return this.requestRepository
      .withdrawOffer(offerId)
      .pipe(tap((offer) => this.replaceOfferInState(offer)));
  }

  getRequestStatistics(): Observable<RequestStatisticsDto> {
    this.errorSignal.set(null);
    return this.requestRepository.getStatistics().pipe(
      tap((stats) => this.statisticsSignal.set(stats)),
      catchError((error) => this.handleError(error))
    );
  }

  getSelectedRequestSnapshot(): BuyerRequest | null {
    return this.selectedRequestSignal();
  }

  getOffersSnapshot(): {
    requestId: string | null;
    items: SellerOffer[];
    isLoading: boolean;
  } {
    return this.offersStateSignal();
  }

  private mergeRequestIntoCollection(request: BuyerRequest): void {
    const snapshot = this.requestsSignal();
    if (!snapshot) {
      return;
    }
    const exists = snapshot.items.some((item) => item.id === request.id);
    if (!exists) {
      return;
    }
    this.requestsSignal.set({
      ...snapshot,
      items: snapshot.items.map((item) =>
        item.id === request.id ? request : item
      ),
    });
  }

  private updateRequestOffersInCollection(
    requestId: string,
    offers: SellerOffer[]
  ): void {
    const snapshot = this.requestsSignal();
    if (!snapshot) {
      return;
    }
    const items = snapshot.items.map((item) => {
      if (item.id !== requestId) {
        return item;
      }
      return item.withOffers(offers);
    });
    this.requestsSignal.set({
      ...snapshot,
      items,
    });
    const selected = this.selectedRequestSignal();
    if (selected?.id === requestId) {
      this.selectedRequestSignal.set(selected.withOffers(offers));
    }
  }

  private setOffersLoading(requestId: string, isLoading: boolean): void {
    const current = this.offersStateSignal();
    this.offersStateSignal.set({
      requestId,
      items: current.requestId === requestId ? current.items : [],
      isLoading,
    });
  }

  private appendOfferToState(requestId: string, offer: SellerOffer): void {
    const current = this.offersStateSignal();
    if (current.requestId !== requestId) {
      this.offersStateSignal.set({
        requestId,
        items: [offer],
        isLoading: false,
      });
    } else {
      this.offersStateSignal.set({
        requestId,
        items: [offer, ...current.items],
        isLoading: current.isLoading,
      });
    }
    this.updateRequestOffersInCollection(requestId, [
      offer,
      ...current.items.filter((item) => item.id !== offer.id),
    ]);
  }

  private replaceOfferInState(offer: SellerOffer): void {
    const current = this.offersStateSignal();
    if (current.requestId !== offer.requestId) {
      return;
    }
    const items = current.items.map((item) =>
      item.id === offer.id ? offer : item
    );
    this.offersStateSignal.set({
      ...current,
      items,
    });
    this.updateRequestOffersInCollection(offer.requestId, items);
  }

  private handleError(error: unknown) {
    const message = this.toErrorMessage(error);
    this.errorSignal.set(message);
    return throwError(() =>
      error instanceof Error ? error : new Error(message)
    );
  }

  private handleOffersError(error: unknown, requestId: string) {
    const message = this.toErrorMessage(error);
    this.errorSignal.set(message);
    this.offersStateSignal.set({
      requestId,
      items: [],
      isLoading: false,
    });
    return throwError(() =>
      error instanceof Error ? error : new Error(message)
    );
  }

  private toErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    if (typeof error === 'string') {
      return error;
    }
    return 'An unexpected error occurred while processing request data.';
  }
}
