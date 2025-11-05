import { Injectable, inject } from '@angular/core';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { RequestRepository } from '../../domains/requests/repositories/request.repository';
import { BuyerRequest as DomainBuyerRequest, SellerOffer as DomainSellerOffer } from '../../domains/requests/models/request.model';
import { BuyerRequestCreateDto, SellerOfferCreateDto, BuyerRequestUpdateDto, StatusUpdateDto } from '../../domains/requests/models/request.dto';
import { 
  BuyerRequest, 
  BuyerRequestCreate, 
  BuyerRequestUpdate,
  SellerOffer,
  SellerOfferCreate,
  RequestStatus,
  ApiResponse,
  PaginatedResponse
} from '../models';
import { tap, map, catchError } from 'rxjs/operators';

export interface RequestState {
  requests: BuyerRequest[];
  currentRequest: BuyerRequest | null;
  myRequests: BuyerRequest[];
  isLoading: boolean;
  error: string | null;
}

export interface RequestFilters {
  status?: RequestStatus;
  category_ids?: number[];
  budget_min?: number;
  budget_max?: number;
  search?: string;
  sort_by?: 'created_at' | 'budget' | 'expires_at';
  sort_order?: 'asc' | 'desc';
}

export interface RequestParams {
  page?: number;
  per_page?: number;
  status?: RequestStatus;
  category_ids?: string[];
  budget_min?: number;
  budget_max?: number;
  search?: string;
  sort_by?: 'created_at' | 'budget' | 'expires_at';
  sort_order?: 'asc' | 'desc';
  [key: string]: unknown;
}

export interface StatusUpdateData {
  status: RequestStatus;
  reason?: string;
}

export interface RequestStatistics {
  total_requests: number;
  open_requests: number;
  fulfilled_requests: number;
  closed_requests: number;
  expired_requests: number;
  my_requests: number;
  my_offers: number;
}

@Injectable({
  providedIn: 'root'
})
export class RequestService {
  private requestRepository = inject(RequestRepository);
  
  private requestStateSubject = new BehaviorSubject<RequestState>({
    requests: [],
    currentRequest: null,
    myRequests: [],
    isLoading: false,
    error: null
  });

  public requestState$ = this.requestStateSubject.asObservable();

  /**
   * Convert domain BuyerRequest to old BuyerRequest interface (for backward compatibility)
   */
  private domainToOldFormat(domainRequest: DomainBuyerRequest): BuyerRequest {
    return {
      id: domainRequest.id,
      user_id: domainRequest.userId,
      title: domainRequest.title,
      description: domainRequest.description,
      budget: domainRequest.budget,
      expires_at: domainRequest.expiresAt,
      status: domainRequest.status,
      category_ids: domainRequest.categoryIds,
      media_ids: [],
      images: [],
      categories: [],
      offers: [],
      views: domainRequest.views,
      upvotes: domainRequest.upvotes,
      created_at: domainRequest.createdAt,
      updated_at: domainRequest.updatedAt
    } as BuyerRequest;
  }

  /**
   * Convert old BuyerRequestCreate to BuyerRequestCreateDto
   */
  private oldToDomainCreate(oldCreate: BuyerRequestCreate): BuyerRequestCreateDto {
    return {
      title: oldCreate.title,
      description: oldCreate.description,
      budget: oldCreate.budget,
      expires_at: oldCreate.expires_at,
      category_ids: oldCreate.category_ids || [],
      media_ids: oldCreate.media_ids,
      metadata: oldCreate.metadata
    };
  }

  // ============================================================================
  // REQUEST OPERATIONS
  // ============================================================================

  /**
   * Get all requests
   * Uses RequestRepository (DDD pattern)
   */
  getRequests(params?: RequestParams): Observable<ApiResponse<PaginatedResponse<BuyerRequest>>> {
    this.setLoading(true);
    
    return this.requestRepository.findAll(params).pipe(
      map((domainRequests: DomainBuyerRequest[]) => {
        const requests = domainRequests.map(r => this.domainToOldFormat(r));
            this.updateRequestState({
          requests,
              isLoading: false,
              error: null
            });
        return {
          success: true,
          data: {
            items: requests,
            pagination: {
              page: 1,
              per_page: 10,
              total_items: requests.length,
              total_pages: 1,
              first_page: 1,
              last_page: 1,
              previous_page: null,
              next_page: null,
              has_next: false,
              has_prev: false
            }
          }
        };
      }),
      catchError((error: Error) => {
          console.error('Error fetching requests:', error);
          this.setError(error.message);
          this.setLoading(false);
        return of({
          success: false,
          data: {
            items: [],
            pagination: {
              page: 1,
              per_page: 10,
              total_items: 0,
              total_pages: 0,
              first_page: 1,
              last_page: 1,
              previous_page: null,
              next_page: null,
              has_next: false,
              has_prev: false
            }
          }
        });
      })
    );
  }

  /**
   * Create new request
   * Uses RequestRepository (DDD pattern)
   */
  createRequest(requestData: BuyerRequestCreate): Observable<ApiResponse<BuyerRequest>> {
    this.setLoading(true);
    
    const createDto = this.oldToDomainCreate(requestData);
    
    return this.requestRepository.create(createDto).pipe(
      map((domainRequest: DomainBuyerRequest) => {
        const newRequest = this.domainToOldFormat(domainRequest);
            const currentRequests = this.getRequestState().requests;
            const currentMyRequests = this.getRequestState().myRequests;
            
            this.updateRequestState({
              requests: [newRequest, ...currentRequests],
              myRequests: [newRequest, ...currentMyRequests],
              currentRequest: newRequest,
              isLoading: false,
              error: null
            });
        return {
          success: true,
          data: newRequest
        };
      }),
      catchError((error: Error) => {
          console.error('Error creating request:', error);
          this.setError(error.message);
          this.setLoading(false);
        throw error;
      })
    );
  }

  /**
   * Get my requests
   * Uses RequestRepository (DDD pattern) - same as getRequests for now
   */
  getMyRequests(params?: RequestParams): Observable<ApiResponse<PaginatedResponse<BuyerRequest>>> {
    this.setLoading(true);
    
    return this.requestRepository.findAll({ ...params, my_requests: true }).pipe(
      map((domainRequests: DomainBuyerRequest[]) => {
        const requests = domainRequests.map(r => this.domainToOldFormat(r));
            this.updateRequestState({
          myRequests: requests,
              isLoading: false,
              error: null
            });
        return {
          success: true,
          data: {
            items: requests,
            pagination: {
              page: 1,
              per_page: 10,
              total_items: requests.length,
              total_pages: 1,
              first_page: 1,
              last_page: 1,
              previous_page: null,
              next_page: null,
              has_next: false,
              has_prev: false
            }
          }
        };
      }),
      catchError((error: Error) => {
          console.error('Error fetching my requests:', error);
          this.setError(error.message);
          this.setLoading(false);
        return of({
          success: false,
          data: {
            items: [],
            pagination: {
              page: 1,
              per_page: 10,
              total_items: 0,
              total_pages: 0,
              first_page: 1,
              last_page: 1,
              previous_page: null,
              next_page: null,
              has_next: false,
              has_prev: false
            }
          }
        });
      })
    );
  }

  /**
   * Get single request
   * Uses RequestRepository (DDD pattern)
   */
  getRequest(requestId: string): Observable<ApiResponse<BuyerRequest>> {
    this.setLoading(true);
    
    return this.requestRepository.findById(requestId).pipe(
      map((domainRequest: DomainBuyerRequest) => {
        const request = this.domainToOldFormat(domainRequest);
            this.updateRequestState({
          currentRequest: request,
              isLoading: false,
              error: null
            });
        return {
          success: true,
          data: request
        };
      }),
      catchError((error: Error) => {
          console.error('Error fetching request:', error);
          this.setError(error.message);
          this.setLoading(false);
        throw error;
      })
    );
  }

  /**
   * Update request
   * Uses RequestRepository (DDD pattern)
   */
  updateRequest(requestId: string, requestData: BuyerRequestUpdate): Observable<ApiResponse<BuyerRequest>> {
    this.setLoading(true);
    
    const updateDto: BuyerRequestUpdateDto = {
      title: requestData.title,
      description: requestData.description,
      budget: requestData.budget,
      expires_at: requestData.expires_at,
      category_ids: requestData.category_ids,
      media_ids: requestData.media_ids,
      metadata: requestData.metadata
    };
    
    return this.requestRepository.update(requestId, updateDto).pipe(
      map((domainRequest: DomainBuyerRequest) => {
        const request = this.domainToOldFormat(domainRequest);
        this.updateRequestInState(requestId, request);
            this.setLoading(false);
        return {
          success: true,
          data: request
        };
      }),
      catchError((error: Error) => {
          console.error('Error updating request:', error);
          this.setError(error.message);
          this.setLoading(false);
        throw error;
      })
    );
  }

  /**
   * Delete request
   * Uses RequestRepository (DDD pattern)
   */
  deleteRequest(requestId: string): Observable<ApiResponse<void>> {
    this.setLoading(true);
    
    return this.requestRepository.delete(requestId).pipe(
      map(() => {
            this.removeRequestFromState(requestId);
            this.setLoading(false);
        return {
          success: true,
          data: void 0
        };
      }),
      catchError((error: Error) => {
          console.error('Error deleting request:', error);
          this.setError(error.message);
          this.setLoading(false);
        throw error;
      })
    );
  }

  /**
   * Update request status
   * Uses RequestRepository (DDD pattern)
   */
  updateRequestStatus(requestId: string, statusData: StatusUpdateData): Observable<ApiResponse<BuyerRequest>> {
    this.setLoading(true);
    
    const statusDto: StatusUpdateDto = {
      status: statusData.status,
      reason: statusData.reason
    };
    
    return this.requestRepository.updateStatus(requestId, statusDto).pipe(
      map((domainRequest: DomainBuyerRequest) => {
        const request = this.domainToOldFormat(domainRequest);
        this.updateRequestStatusInState(requestId, request.status);
            this.setLoading(false);
        return {
          success: true,
          data: request
        };
      }),
      catchError((error: Error) => {
          console.error('Error updating request status:', error);
          this.setError(error.message);
          this.setLoading(false);
        throw error;
      })
    );
  }

  /**
   * Upvote request
   * Uses RequestRepository (DDD pattern)
   */
  upvoteRequest(requestId: string): Observable<ApiResponse<{ success: boolean; new_count: number }>> {
    return this.requestRepository.upvote(requestId).pipe(
      map((result) => {
        this.updateRequestUpvotes(requestId, result.new_count);
        return {
          success: result.success,
          data: result
        };
      }),
      catchError((error: Error) => {
          console.error('Error upvoting request:', error);
          this.setError(error.message);
        throw error;
      })
    );
  }

  /**
   * Get request offers
   * Uses RequestRepository (DDD pattern)
   */
  getRequestOffers(requestId: string): Observable<ApiResponse<SellerOffer[]>> {
    return this.requestRepository.getOffers(requestId).pipe(
      map((domainOffers: DomainSellerOffer[]) => {
        const offers = domainOffers.map(offer => ({
          id: offer.id,
          request_id: offer.requestId,
          seller_id: offer.sellerId,
          price: offer.price,
          message: offer.message,
          status: offer.status,
          created_at: offer.createdAt
        } as SellerOffer));
        return {
          success: true,
          data: offers
        };
      }),
      catchError((error: Error) => {
        console.error('Error getting request offers:', error);
        return of({
          success: false,
          data: [],
          error: error.message
        });
      })
    );
  }

  /**
   * Add offer to request
   * Uses RequestRepository (DDD pattern)
   */
  addOffer(requestId: string, offerData: SellerOfferCreate): Observable<ApiResponse<SellerOffer>> {
    this.setLoading(true);
    
    const offerDto: SellerOfferCreateDto = {
      product_id: offerData.product_id,
      price: offerData.price,
      message: offerData.message || ''
    };
    
    return this.requestRepository.createOffer(requestId, offerDto).pipe(
      map((domainOffer: DomainSellerOffer) => {
        const offer: SellerOffer = {
          id: domainOffer.id,
          request_id: domainOffer.requestId,
          seller_id: domainOffer.sellerId,
          price: domainOffer.price,
          message: domainOffer.message,
          status: domainOffer.status,
          created_at: domainOffer.createdAt
        } as SellerOffer;
            this.setLoading(false);
        return {
          success: true,
          data: offer
        };
      }),
      catchError((error: Error) => {
          console.error('Error adding offer:', error);
          this.setError(error.message);
          this.setLoading(false);
        throw error;
      })
    );
  }

  /**
   * Accept offer
   * Uses RequestRepository (DDD pattern)
   */
  acceptOffer(offerId: string): Observable<ApiResponse<SellerOffer>> {
    this.setLoading(true);
    
    return this.requestRepository.acceptOffer(offerId).pipe(
      map((domainOffer: DomainSellerOffer) => {
        const offer: SellerOffer = {
          id: domainOffer.id,
          request_id: domainOffer.requestId,
          seller_id: domainOffer.sellerId,
          price: domainOffer.price,
          message: domainOffer.message,
          status: domainOffer.status,
          created_at: domainOffer.createdAt
        } as SellerOffer;
            this.updateOfferStatus(offerId, 'accepted');
            this.setLoading(false);
        return {
          success: true,
          data: offer
        };
      }),
      catchError((error: Error) => {
          console.error('Error accepting offer:', error);
          this.setError(error.message);
          this.setLoading(false);
        throw error;
      })
    );
  }

  /**
   * Reject offer
   * Uses RequestRepository (DDD pattern)
   */
  rejectOffer(offerId: string): Observable<ApiResponse<SellerOffer>> {
    this.setLoading(true);
    
    return this.requestRepository.rejectOffer(offerId).pipe(
      map((domainOffer: DomainSellerOffer) => {
        const offer: SellerOffer = {
          id: domainOffer.id,
          request_id: domainOffer.requestId,
          seller_id: domainOffer.sellerId,
          price: domainOffer.price,
          message: domainOffer.message,
          status: domainOffer.status,
          created_at: domainOffer.createdAt
        } as SellerOffer;
            this.updateOfferStatus(offerId, 'rejected');
            this.setLoading(false);
        return {
          success: true,
          data: offer
        };
      }),
      catchError((error: Error) => {
          console.error('Error rejecting offer:', error);
          this.setError(error.message);
          this.setLoading(false);
        throw error;
      })
    );
  }

  /**
   * Withdraw offer
   * Uses RequestRepository (DDD pattern)
   */
  withdrawOffer(offerId: string): Observable<ApiResponse<SellerOffer>> {
    this.setLoading(true);
    
    return this.requestRepository.withdrawOffer(offerId).pipe(
      map((domainOffer: DomainSellerOffer) => {
        const offer: SellerOffer = {
          id: domainOffer.id,
          request_id: domainOffer.requestId,
          seller_id: domainOffer.sellerId,
          price: domainOffer.price,
          message: domainOffer.message,
          status: domainOffer.status,
          created_at: domainOffer.createdAt
        } as SellerOffer;
            this.updateOfferStatus(offerId, 'withdrawn');
            this.setLoading(false);
        return {
          success: true,
          data: offer
        };
      }),
      catchError((error: Error) => {
          console.error('Error withdrawing offer:', error);
          this.setError(error.message);
          this.setLoading(false);
        throw error;
      })
    );
  }

  // ============================================================================
  // REQUEST UTILITIES
  // ============================================================================

  /**
   * Get current request state
   */
  getRequestState(): RequestState {
    return this.requestStateSubject.value;
  }

  /**
   * Get current request
   */
  getCurrentRequest(): BuyerRequest | null {
    return this.getRequestState().currentRequest;
  }

  /**
   * Get requests observable
   */
  getRequests$(): Observable<BuyerRequest[]> {
    return this.requestState$.pipe(
      map(state => state.requests)
    );
  }

  /**
   * Get current request observable
   */
  getCurrentRequest$(): Observable<BuyerRequest | null> {
    return this.requestState$.pipe(
      map(state => state.currentRequest)
    );
  }

  /**
   * Get my requests observable
   */
  getMyRequests$(): Observable<BuyerRequest[]> {
    return this.requestState$.pipe(
      map(state => state.myRequests)
    );
  }

  /**
   * Get loading state observable
   */
  getLoading$(): Observable<boolean> {
    return this.requestState$.pipe(
      map(state => state.isLoading)
    );
  }

  /**
   * Get error state observable
   */
  getError$(): Observable<string | null> {
    return this.requestState$.pipe(
      map(state => state.error)
    );
  }

  /**
   * Update request state
   */
  private updateRequestState(partial: Partial<RequestState>): void {
    const currentState = this.getRequestState();
    const newState = { ...currentState, ...partial };
    this.requestStateSubject.next(newState);
  }

  /**
   * Set loading state
   */
  private setLoading(isLoading: boolean): void {
    this.updateRequestState({ isLoading });
  }

  /**
   * Set error state
   */
  private setError(error: string): void {
    this.updateRequestState({ error });
  }

  /**
   * Clear error
   */
  clearError(): void {
    this.updateRequestState({ error: null });
  }

  /**
   * Update request in state
   */
  private updateRequestInState(requestId: string, updatedRequest: BuyerRequest): void {
    const currentRequests = this.getRequestState().requests;
    const currentMyRequests = this.getRequestState().myRequests;
    
    const updatedRequests = currentRequests.map(req => 
      req.id === requestId ? updatedRequest : req
    );
    
    const updatedMyRequests = currentMyRequests.map(req => 
      req.id === requestId ? updatedRequest : req
    );
    
    this.updateRequestState({
      requests: updatedRequests,
      myRequests: updatedMyRequests
    });
    
    // Update current request if it matches
    const currentRequest = this.getCurrentRequest();
    if (currentRequest && currentRequest.id === requestId) {
      this.updateRequestState({ currentRequest: updatedRequest });
    }
  }

  /**
   * Remove request from state
   */
  private removeRequestFromState(requestId: string): void {
    const currentRequests = this.getRequestState().requests;
    const currentMyRequests = this.getRequestState().myRequests;
    
    const updatedRequests = currentRequests.filter(req => req.id !== requestId);
    const updatedMyRequests = currentMyRequests.filter(req => req.id !== requestId);
    
    this.updateRequestState({
      requests: updatedRequests,
      myRequests: updatedMyRequests
    });
    
    // Clear current request if it matches
    const currentRequest = this.getCurrentRequest();
    if (currentRequest && currentRequest.id === requestId) {
      this.updateRequestState({ currentRequest: null });
    }
  }

  /**
   * Update request status in state
   */
  private updateRequestStatusInState(requestId: string, status: RequestStatus): void {
    const currentRequests = this.getRequestState().requests;
    const currentMyRequests = this.getRequestState().myRequests;
    
    const updatedRequests = currentRequests.map(req => 
      req.id === requestId ? { ...req, status } : req
    );
    
    const updatedMyRequests = currentMyRequests.map(req => 
      req.id === requestId ? { ...req, status } : req
    );
    
    this.updateRequestState({
      requests: updatedRequests,
      myRequests: updatedMyRequests
    });
    
    // Update current request if it matches
    const currentRequest = this.getCurrentRequest();
    if (currentRequest && currentRequest.id === requestId) {
      this.updateRequestState({ currentRequest: { ...currentRequest, status } });
    }
  }

  /**
   * Update request upvotes in state
   */
  private updateRequestUpvotes(requestId: string, upvotes: number): void {
    const currentRequests = this.getRequestState().requests;
    const currentMyRequests = this.getRequestState().myRequests;
    
    const updatedRequests = currentRequests.map(req => 
      req.id === requestId ? { ...req, upvotes } : req
    );
    
    const updatedMyRequests = currentMyRequests.map(req => 
      req.id === requestId ? { ...req, upvotes } : req
    );
    
    this.updateRequestState({
      requests: updatedRequests,
      myRequests: updatedMyRequests
    });
    
    // Update current request if it matches
    const currentRequest = this.getCurrentRequest();
    if (currentRequest && currentRequest.id === requestId) {
      this.updateRequestState({ currentRequest: { ...currentRequest, upvotes } });
    }
  }

  /**
   * Update offer status in state
   */
  private updateOfferStatus(offerId: string, status: 'pending' | 'accepted' | 'rejected' | 'withdrawn'): void {
    const currentRequest = this.getCurrentRequest();
    if (currentRequest) {
      const updatedOffers = currentRequest.offers.map(offer => 
        offer.id === offerId ? { ...offer, status } : offer
      );
      
      this.updateRequestState({
        currentRequest: { ...currentRequest, offers: updatedOffers }
      });
    }
  }

  /**
   * Get request by ID
   */
  getRequestById(requestId: string): BuyerRequest | null {
    const requests = this.getRequestState().requests;
    return requests.find(r => r.id === requestId) || null;
  }

  /**
   * Get requests by status
   */
  getRequestsByStatus(status: RequestStatus): BuyerRequest[] {
    const requests = this.getRequestState().requests;
    return requests.filter(r => r.status === status);
  }

  /**
   * Get my requests by status
   */
  getMyRequestsByStatus(status: RequestStatus): BuyerRequest[] {
    const myRequests = this.getRequestState().myRequests;
    return myRequests.filter(r => r.status === status);
  }

  /**
   * Format request budget
   */
  formatRequestBudget(budget: number, currency: string = 'NGN'): string {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: currency
    }).format(budget);
  }

  /**
   * Get request status display
   */
  getRequestStatusDisplay(status: RequestStatus): string {
    const statusMap: Record<RequestStatus, string> = {
      'OPEN': 'Open',
      'FULFILLED': 'Fulfilled',
      'CLOSED': 'Closed',
      'EXPIRED': 'Expired'
    };
    
    return statusMap[status] || 'Unknown';
  }

  /**
   * Get request status color
   */
  getRequestStatusColor(status: RequestStatus): string {
    const colorMap: Record<RequestStatus, string> = {
      'OPEN': 'text-green-600',
      'FULFILLED': 'text-blue-600',
      'CLOSED': 'text-gray-600',
      'EXPIRED': 'text-red-600'
    };
    
    return colorMap[status] || 'text-gray-600';
  }

  /**
   * Get request status icon
   */
  getRequestStatusIcon(status: RequestStatus): string {
    const iconMap: Record<RequestStatus, string> = {
      'OPEN': 'clock',
      'FULFILLED': 'check-circle',
      'CLOSED': 'x-circle',
      'EXPIRED': 'clock'
    };
    
    return iconMap[status] || 'help-circle';
  }

  /**
   * Check if request is open
   */
  isRequestOpen(request: BuyerRequest): boolean {
    return request.status === 'OPEN';
  }

  /**
   * Check if request is fulfilled
   */
  isRequestFulfilled(request: BuyerRequest): boolean {
    return request.status === 'FULFILLED';
  }

  /**
   * Check if request is expired
   */
  isRequestExpired(request: BuyerRequest): boolean {
    return request.status === 'EXPIRED' || !!(request.expires_at && new Date(request.expires_at) < new Date());
  }

  /**
   * Check if request can be updated
   */
  canUpdateRequest(request: BuyerRequest): boolean {
    return request.status === 'OPEN' && !this.isRequestExpired(request);
  }

  /**
   * Check if request can be deleted
   */
  canDeleteRequest(request: BuyerRequest): boolean {
    return request.status === 'OPEN' && request.offers.length === 0;
  }

  /**
   * Get request statistics
   * Note: Repository doesn't have statistics method yet
   */
  getRequestStatistics(): Observable<ApiResponse<RequestStatistics>> {
    return this.requestRepository.getStatistics().pipe(
      map((stats) => ({
        success: true,
        data: {
          total_requests: stats.total_requests,
          open_requests: stats.open_requests,
          fulfilled_requests: stats.fulfilled_requests,
          closed_requests: stats.closed_requests,
          expired_requests: stats.expired_requests,
          my_requests: stats.my_requests,
          my_offers: stats.my_offers
        }
      })),
      catchError((error: Error) => {
        console.error('Error getting request statistics:', error);
        return of({
          success: false,
          data: {
            total_requests: 0,
            open_requests: 0,
            fulfilled_requests: 0,
            closed_requests: 0,
            expired_requests: 0,
            my_requests: 0,
            my_offers: 0
          },
          error: error.message
        });
      })
    );
  }

  /**
   * Validate request data
   */
  validateRequestData(requestData: BuyerRequestCreate): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!requestData.title || requestData.title.trim().length === 0) {
      errors.push('Title is required');
    }

    if (!requestData.description || requestData.description.trim().length === 0) {
      errors.push('Description is required');
    }

    if (requestData.budget && requestData.budget <= 0) {
      errors.push('Budget must be greater than 0');
    }

    if (!requestData.category_ids || requestData.category_ids.length === 0) {
      errors.push('At least one category is required');
    }

    return { isValid: errors.length === 0, errors };
  }

  /**
   * Clear current request
   */
  clearCurrentRequest(): void {
    this.updateRequestState({ currentRequest: null });
  }

  /**
   * Refresh requests
   */
  refreshRequests(): void {
    this.getRequests().subscribe();
  }

  /**
   * Refresh my requests
   */
  refreshMyRequests(): void {
    this.getMyRequests().subscribe();
  }
} 