/**
 * Privacy Settings Repository
 *
 * Handles all privacy settings-related API calls.
 * Uses ApiClientService for HTTP requests.
 * Converts DTOs to domain models.
 */

import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiClientService } from '../../../core/infrastructure/http/api-client.service';
import {
  PrivacySettingsDto,
  PrivacySettingsUpdateDto,
} from '../models/privacy-settings.dto';
import { PrivacySettings } from '../models/privacy-settings.model';

@Injectable({
  providedIn: 'root',
})
export class PrivacySettingsRepository {
  private apiClient = inject(ApiClientService);
  private readonly baseEndpoint = '/users/privacy-settings';

  /**
   * Convert PrivacySettingsDto to PrivacySettings domain model
   */
  private toDomain(dto: PrivacySettingsDto): PrivacySettings {
    return PrivacySettings.fromDto(dto);
  }

  /**
   * Get privacy settings
   */
  find(): Observable<PrivacySettings> {
    return this.apiClient
      .get<PrivacySettingsDto>(this.baseEndpoint)
      .pipe(map((response) => this.toDomain(response.data)));
  }

  /**
   * Update privacy settings
   */
  update(data: PrivacySettingsUpdateDto): Observable<PrivacySettings> {
    return this.apiClient
      .patch<PrivacySettingsDto>(this.baseEndpoint, data)
      .pipe(map((response) => this.toDomain(response.data)));
  }
}

