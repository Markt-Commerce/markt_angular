/**
 * Seller Start Cards Repository
 * 
 * Handles seller onboarding/start cards API calls.
 */

import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiClientService } from '../../../core/infrastructure/http/api-client.service';
import { StartCardsResponseDto } from '../models/user.dto';
import {
  StartCardsResponse,
  StartCard,
  StartCardCTA,
  StartCardProgress,
  StartCardsMetadata
} from '../models/seller-start-cards.model';

@Injectable({
  providedIn: 'root'
})
export class SellerStartCardsRepository {
  private apiClient = inject(ApiClientService);
  private readonly baseEndpoint = '/api/v1/users/sellers/start-cards';

  /**
   * Convert StartCardsResponseDto to domain model
   */
  private toDomain(dto: StartCardsResponseDto): StartCardsResponse {
    const cards: StartCard[] = dto.items.map(item => {
      const cta: StartCardCTA = {
        label: item.cta.label,
        href: item.cta.href
      };

      const progress: StartCardProgress | undefined = item.progress ? {
        current: item.progress.current,
        target: item.progress.target
      } : undefined;

      return new StartCard(
        item.key,
        item.title,
        item.description,
        cta,
        item.completed,
        progress
      );
    });

    const metadata = new StartCardsMetadata(
      dto.metadata.seller_id,
      dto.metadata.generated_at
    );

    return new StartCardsResponse(cards, metadata);
  }

  /**
   * Get seller start cards
   */
  getStartCards(): Observable<StartCardsResponse> {
    return this.apiClient.get<StartCardsResponseDto>(this.baseEndpoint).pipe(
      map(response => this.toDomain(response.data))
    );
  }
}

