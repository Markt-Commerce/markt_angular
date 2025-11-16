/**
 * Privacy Settings Service
 *
 * Domain service for managing privacy settings.
 * Uses PrivacySettingsRepository for data access.
 */

import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { PrivacySettingsRepository } from '../repositories/privacy-settings.repository';
import { PrivacySettings } from '../models/privacy-settings.model';
import { PrivacySettingsUpdateDto } from '../models/privacy-settings.dto';

@Injectable({
  providedIn: 'root',
})
export class PrivacySettingsService {
  private readonly privacySettingsRepository = inject(
    PrivacySettingsRepository
  );

  /**
   * Get privacy settings
   */
  getPrivacySettings(): Observable<PrivacySettings> {
    return this.privacySettingsRepository.find();
  }

  /**
   * Update privacy settings
   */
  updatePrivacySettings(
    settings: PrivacySettingsUpdateDto
  ): Observable<PrivacySettings> {
    return this.privacySettingsRepository.update(settings);
  }
}
