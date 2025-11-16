/**
 * Seller Analytics Domain Models
 *
 * Domain entities for seller analytics and start cards.
 */

export interface AnalyticsTimeseriesPoint {
  bucketStart: string;
  value: number;
}

export interface AnalyticsTimeseriesTotals {
  value: number;
  count: number;
}

/**
 * Seller Analytics Overview Domain Entity
 */
export class SellerAnalyticsOverview {
  constructor(
    public readonly revenue30d: number,
    public readonly orders30d: number,
    public readonly views30d: number,
    public readonly conversion30d: number
  ) {}

  /**
   * Business Rule: Check if analytics show growth
   */
  hasGrowth(): boolean {
    return this.orders30d > 0 && this.revenue30d > 0;
  }

  /**
   * Business Rule: Get conversion rate percentage
   */
  getConversionRate(): number {
    return this.conversion30d;
  }

  /**
   * Business Rule: Get average order value
   */
  getAverageOrderValue(): number {
    return this.orders30d > 0 ? this.revenue30d / this.orders30d : 0;
  }
}

/**
 * Seller Analytics Timeseries Domain Entity
 */
export class SellerAnalyticsTimeseries {
  constructor(
    public readonly metric: 'sales' | 'orders' | 'views' | 'conversion',
    public readonly bucket: 'day' | 'week' | 'month',
    public readonly series: AnalyticsTimeseriesPoint[],
    public readonly totals: AnalyticsTimeseriesTotals
  ) {}

  /**
   * Business Rule: Get total value
   */
  getTotalValue(): number {
    return this.totals.value;
  }

  /**
   * Business Rule: Get data point count
   */
  getDataPointCount(): number {
    return this.totals.count;
  }

  /**
   * Business Rule: Get latest value
   */
  getLatestValue(): number {
    if (this.series.length === 0) {
      return 0;
    }
    return this.series[this.series.length - 1].value;
  }
}
