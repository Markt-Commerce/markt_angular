/**
 * Seller Analytics Repository
 *
 * Handles all seller analytics API calls.
 */

import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiClientService } from '../../../core/infrastructure/http/api-client.service';
import {
  SellerAnalyticsOverviewDto,
  SellerAnalyticsOverviewQueryDto,
  SellerAnalyticsTimeseriesDto,
  SellerAnalyticsTimeseriesQueryDto,
} from '../models/user.dto';
import {
  SellerAnalyticsOverview,
  SellerAnalyticsTimeseries,
  AnalyticsTimeseriesPoint,
  AnalyticsTimeseriesTotals,
} from '../models/seller-analytics.model';

@Injectable({
  providedIn: 'root',
})
export class SellerAnalyticsRepository {
  private apiClient = inject(ApiClientService);
  private readonly baseEndpoint = '/api/v1/users/sellers/analytics';

  /**
   * Convert SellerAnalyticsOverviewDto to domain model
   */
  private toOverviewDomain(
    dto: SellerAnalyticsOverviewDto
  ): SellerAnalyticsOverview {
    return new SellerAnalyticsOverview(
      dto.revenue_30d,
      dto.orders_30d,
      dto.views_30d,
      dto.conversion_30d
    );
  }

  /**
   * Convert SellerAnalyticsTimeseriesDto to domain model
   */
  private toTimeseriesDomain(
    dto: SellerAnalyticsTimeseriesDto
  ): SellerAnalyticsTimeseries {
    const series: AnalyticsTimeseriesPoint[] = dto.series.map((point) => ({
      bucketStart: point.bucket_start,
      value: point.value,
    }));

    const totals: AnalyticsTimeseriesTotals = {
      value: dto.totals.value,
      count: dto.totals.count,
    };

    return new SellerAnalyticsTimeseries(
      dto.metric,
      dto.bucket,
      series,
      totals
    );
  }

  /**
   * Get seller analytics overview
   */
  getAnalyticsOverview(
    params?: SellerAnalyticsOverviewQueryDto
  ): Observable<SellerAnalyticsOverview> {
    return this.apiClient
      .get<SellerAnalyticsOverviewDto>(
        `${this.baseEndpoint}/overview`,
        params as Record<string, unknown>
      )
      .pipe(map((response) => this.toOverviewDomain(response.data)));
  }

  /**
   * Get seller analytics timeseries data
   */
  getAnalyticsTimeseries(
    params: SellerAnalyticsTimeseriesQueryDto
  ): Observable<SellerAnalyticsTimeseries> {
    return this.apiClient
      .get<SellerAnalyticsTimeseriesDto>(
        `${this.baseEndpoint}/timeseries`,
        params as unknown as Record<string, unknown>
      )
      .pipe(map((response) => this.toTimeseriesDomain(response.data)));
  }
}
