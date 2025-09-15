import { Injectable, inject } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { ApiService } from './api.service';
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
import { tap, map } from 'rxjs/operators';

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
  private apiService = inject(ApiService);
  
  private requestStateSubject = new BehaviorSubject<RequestState>({
    requests: [],
    currentRequest: null,
    myRequests: [],
    isLoading: false,
    error: null
  });

  public requestState$ = this.requestStateSubject.asObservable();

  // ============================================================================
  // REQUEST OPERATIONS
  // ============================================================================

  /**
   * Get all requests
   */
  getRequests(params?: RequestParams): Observable<ApiResponse<PaginatedResponse<BuyerRequest>>> {
    this.setLoading(true);
    
    return this.apiService.getRequests(params).pipe(
      tap({
        next: (response: ApiResponse<PaginatedResponse<BuyerRequest>>) => {
          if (response.success) {
            this.updateRequestState({
              requests: response.data.items,
              isLoading: false,
              error: null
            });
          }
        },
        error: (error: Error) => {
          console.error('Error fetching requests:', error);
          this.setError(error.message);
          this.setLoading(false);
        }
      })
    );
  }

  /**
   * Create new request
   */
  createRequest(requestData: BuyerRequestCreate): Observable<ApiResponse<BuyerRequest>> {
    this.setLoading(true);
    
    return this.apiService.createRequest(requestData).pipe(
      tap({
        next: (response: ApiResponse<BuyerRequest>) => {
          if (response.success) {
            const newRequest = response.data;
            const currentRequests = this.getRequestState().requests;
            const currentMyRequests = this.getRequestState().myRequests;
            
            this.updateRequestState({
              requests: [newRequest, ...currentRequests],
              myRequests: [newRequest, ...currentMyRequests],
              currentRequest: newRequest,
              isLoading: false,
              error: null
            });
          }
        },
        error: (error: Error) => {
          console.error('Error creating request:', error);
          this.setError(error.message);
          this.setLoading(false);
        }
      })
    );
  }

  /**
   * Get my requests
   */
  getMyRequests(params?: RequestParams): Observable<ApiResponse<PaginatedResponse<BuyerRequest>>> {
    this.setLoading(true);
    
    return this.apiService.getMyRequests(params).pipe(
      tap({
        next: (response: ApiResponse<PaginatedResponse<BuyerRequest>>) => {
          if (response.success) {
            this.updateRequestState({
              myRequests: response.data.items,
              isLoading: false,
              error: null
            });
          }
        },
        error: (error: Error) => {
          console.error('Error fetching my requests:', error);
          this.setError(error.message);
          this.setLoading(false);
        }
      })
    );
  }

  /**
   * Get single request
   */
  getRequest(requestId: string): Observable<ApiResponse<BuyerRequest>> {
    this.setLoading(true);
    
    return this.apiService.getRequest(requestId).pipe(
      tap({
        next: (response: ApiResponse<BuyerRequest>) => {
          if (response.success) {
            this.updateRequestState({
              currentRequest: response.data,
              isLoading: false,
              error: null
            });
          }
        },
        error: (error: Error) => {
          console.error('Error fetching request:', error);
          this.setError(error.message);
          this.setLoading(false);
        }
      })
    );
  }

  /**
   * Update request
   */
  updateRequest(requestId: string, requestData: BuyerRequestUpdate): Observable<ApiResponse<BuyerRequest>> {
    this.setLoading(true);
    
    // Convert BuyerRequestUpdate to RequestData format
    const apiRequestData = {
      title: requestData.title || '',
      description: requestData.description || '',
      budget: requestData.budget,
      expires_at: requestData.expires_at,
      category_ids: requestData.category_ids || [],
      media_ids: requestData.media_ids,
      metadata: requestData.metadata
    };
    
    return this.apiService.updateRequest(requestId, apiRequestData).pipe(
      tap({
        next: (response: ApiResponse<BuyerRequest>) => {
          if (response.success) {
            this.updateRequestInState(requestId, response.data);
            this.setLoading(false);
          }
        },
        error: (error: Error) => {
          console.error('Error updating request:', error);
          this.setError(error.message);
          this.setLoading(false);
        }
      })
    );
  }

  /**
   * Delete request
   */
  deleteRequest(requestId: string): Observable<ApiResponse<void>> {
    this.setLoading(true);
    
    return this.apiService.deleteRequest(requestId).pipe(
      tap({
        next: (response: ApiResponse<void>) => {
          if (response.success) {
            this.removeRequestFromState(requestId);
            this.setLoading(false);
          }
        },
        error: (error: Error) => {
          console.error('Error deleting request:', error);
          this.setError(error.message);
          this.setLoading(false);
        }
      })
    );
  }

  /**
   * Update request status
   */
  updateRequestStatus(requestId: string, statusData: StatusUpdateData): Observable<ApiResponse<BuyerRequest>> {
    this.setLoading(true);
    
    return this.apiService.updateRequestStatus(requestId, statusData).pipe(
      tap({
        next: (response: ApiResponse<BuyerRequest>) => {
          if (response.success) {
            this.updateRequestStatusInState(requestId, response.data.status);
            this.setLoading(false);
          }
        },
        error: (error: Error) => {
          console.error('Error updating request status:', error);
          this.setError(error.message);
          this.setLoading(false);
        }
      })
    );
  }

  /**
   * Upvote request
   */
  upvoteRequest(requestId: string): Observable<ApiResponse<{ success: boolean; new_count: number }>> {
    return this.apiService.upvoteRequest(requestId).pipe(
      tap({
        next: (response: ApiResponse<{ success: boolean; new_count: number }>) => {
          if (response.success) {
            this.updateRequestUpvotes(requestId, response.data.new_count);
          }
        },
        error: (error: Error) => {
          console.error('Error upvoting request:', error);
          this.setError(error.message);
        }
      })
    );
  }

  /**
   * Get request offers
   */
  getRequestOffers(requestId: string): Observable<ApiResponse<SellerOffer[]>> {
    return this.apiService.getRequestOffers(requestId);
  }

  /**
   * Add offer to request
   */
  addOffer(requestId: string, offerData: SellerOfferCreate): Observable<ApiResponse<SellerOffer>> {
    this.setLoading(true);
    
    return this.apiService.createOffer(requestId, offerData).pipe(
      tap({
        next: (response: ApiResponse<SellerOffer>) => {
          if (response.success) {
            this.setLoading(false);
          }
        },
        error: (error: Error) => {
          console.error('Error adding offer:', error);
          this.setError(error.message);
          this.setLoading(false);
        }
      })
    );
  }

  /**
   * Accept offer
   */
  acceptOffer(offerId: string): Observable<ApiResponse<SellerOffer>> {
    this.setLoading(true);
    
    return this.apiService.acceptOffer(offerId).pipe(
      tap({
        next: (response: ApiResponse<SellerOffer>) => {
          if (response.success) {
            this.updateOfferStatus(offerId, 'accepted');
            this.setLoading(false);
          }
        },
        error: (error: Error) => {
          console.error('Error accepting offer:', error);
          this.setError(error.message);
          this.setLoading(false);
        }
      })
    );
  }

  /**
   * Reject offer
   */
  rejectOffer(offerId: string): Observable<ApiResponse<SellerOffer>> {
    this.setLoading(true);
    
    return this.apiService.rejectOffer(offerId).pipe(
      tap({
        next: (response: ApiResponse<SellerOffer>) => {
          if (response.success) {
            this.updateOfferStatus(offerId, 'rejected');
            this.setLoading(false);
          }
        },
        error: (error: Error) => {
          console.error('Error rejecting offer:', error);
          this.setError(error.message);
          this.setLoading(false);
        }
      })
    );
  }

  /**
   * Withdraw offer
   */
  withdrawOffer(offerId: string): Observable<ApiResponse<SellerOffer>> {
    this.setLoading(true);
    
    return this.apiService.withdrawOffer(offerId).pipe(
      tap({
        next: (response: ApiResponse<SellerOffer>) => {
          if (response.success) {
            this.updateOfferStatus(offerId, 'withdrawn');
            this.setLoading(false);
          }
        },
        error: (error: Error) => {
          console.error('Error withdrawing offer:', error);
          this.setError(error.message);
          this.setLoading(false);
        }
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
   */
  getRequestStatistics(): Observable<ApiResponse<RequestStatistics>> {
    return this.apiService.get<RequestStatistics>('/requests/statistics').pipe(
      map(response => response)
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