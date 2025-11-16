import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  SellerAnalyticsService,
  SellerAnalyticsTimeseries,
  AnalyticsTimeseriesPoint,
} from '../../../domains/authentication';
import {
  faChartLine,
  faDollarSign,
  faShoppingCart,
  faUsers,
  faPercentage,
  faLaptop,
  faShirt,
  faBook,
  faDownload,
  faCalendar,
  faSearch,
  faLink,
} from '@fortawesome/free-solid-svg-icons';
import {
  faInstagram as faInstagramBrand,
  faFacebook as faFacebookBrand,
} from '@fortawesome/free-brands-svg-icons';

declare const Highcharts: any;

interface AnalyticsMetrics {
  totalRevenue: number;
  totalOrders: number;
  newCustomers: number;
  conversionRate: number;
}

interface ProductPerformance {
  name: string;
  category: string;
  price: number;
  growth: number;
  icon: any;
}

interface TrafficSource {
  name: string;
  percentage: number;
  icon: any;
  color: string;
}

interface InventoryStatus {
  status: string;
  count: number;
  color: string;
  bgColor: string;
  borderColor: string;
}

interface DemographicsData {
  ageGroup: string;
  percentage: number;
}

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.css'],
})
export class AnalyticsComponent implements OnInit {
  private analyticsService = inject(SellerAnalyticsService);

  // Make Math available in template
  Math = Math;

  // Font Awesome Icons
  faChartLine = faChartLine;
  faDollarSign = faDollarSign;
  faShoppingCart = faShoppingCart;
  faUsers = faUsers;
  faPercentage = faPercentage;
  faLaptop = faLaptop;
  faShirt = faShirt;
  faBook = faBook;
  faDownload = faDownload;
  faCalendar = faCalendar;
  faSearch = faSearch;
  faLink = faLink;
  faInstagramBrand = faInstagramBrand;
  faFacebookBrand = faFacebookBrand;

  // Signals for reactive state management
  metrics = signal<AnalyticsMetrics>({
    totalRevenue: 0,
    totalOrders: 0,
    newCustomers: 0,
    conversionRate: 0,
  });

  revenueGrowth = signal(0);
  ordersGrowth = signal(0);
  customersGrowth = signal(0);
  conversionGrowth = signal(0);

  selectedTimeRange = signal<string>('30D');
  isLoading = signal<boolean>(false);
  timeseriesData = signal<SellerAnalyticsTimeseries | null>(null);

  topProducts = signal<ProductPerformance[]>([
    {
      name: 'MacBook Pro 16"',
      category: 'Electronics',
      price: 2399,
      growth: 24,
      icon: faLaptop,
    },
    {
      name: 'Vintage T-Shirt',
      category: 'Fashion',
      price: 29,
      growth: 18,
      icon: faShirt,
    },
    {
      name: 'Study Guide Set',
      category: 'Books',
      price: 45,
      growth: 12,
      icon: faBook,
    },
  ]);

  trafficSources = signal<TrafficSource[]>([
    {
      name: 'Instagram',
      percentage: 40,
      icon: faInstagramBrand,
      color: '#E4405F',
    },
    {
      name: 'Organic Search',
      percentage: 30,
      icon: faSearch,
      color: '#3B82F6',
    },
    {
      name: 'Direct',
      percentage: 15,
      icon: faLink,
      color: '#10B981',
    },
    {
      name: 'Facebook',
      percentage: 15,
      icon: faFacebookBrand,
      color: '#1877F2',
    },
  ]);

  inventoryStatus = signal<InventoryStatus[]>([
    {
      status: 'In Stock',
      count: 156,
      color: '#10B981',
      bgColor: '#F0FDF4',
      borderColor: '#BBF7D0',
    },
    {
      status: 'Low Stock',
      count: 23,
      color: '#F59E0B',
      bgColor: '#FFFBEB',
      borderColor: '#FED7AA',
    },
    {
      status: 'Out of Stock',
      count: 8,
      color: '#EF4444',
      bgColor: '#FEF2F2',
      borderColor: '#FECACA',
    },
  ]);

  demographicsData = signal<DemographicsData[]>([
    { ageGroup: '18-22 years', percentage: 45 },
    { ageGroup: '23-25 years', percentage: 32 },
    { ageGroup: '26+ years', percentage: 23 },
  ]);

  ngOnInit(): void {
    this.loadAnalyticsData();
  }

  /**
   * Load analytics data from backend
   */
  private loadAnalyticsData(): void {
    this.isLoading.set(true);

    // Get window days from selected time range
    const windowDays = this.getWindowDaysFromRange(this.selectedTimeRange());

    // Load analytics overview
    this.analyticsService
      .getAnalyticsOverview({ window_days: windowDays })
      .subscribe({
        next: (overview) => {
          this.metrics.set({
            totalRevenue: overview.revenue30d,
            totalOrders: overview.orders30d,
            newCustomers: 0, // Not available in overview, would need separate endpoint
            conversionRate: overview.conversion30d,
          });
          this.isLoading.set(false);
        },
        error: (error) => {
          console.error('Error loading analytics overview:', error);
          this.isLoading.set(false);
        },
      });

    // Load timeseries data for charts
    this.loadTimeseriesData();
  }

  /**
   * Load timeseries data for revenue chart
   */
  private loadTimeseriesData(): void {
    const endDate = new Date();
    const startDate = new Date();
    const windowDays = this.getWindowDaysFromRange(this.selectedTimeRange());
    startDate.setDate(startDate.getDate() - windowDays);

    // Load sales timeseries
    this.analyticsService
      .getAnalyticsTimeseries({
        metric: 'sales',
        bucket: this.getBucketFromRange(this.selectedTimeRange()),
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
      })
      .subscribe({
        next: (timeseries) => {
          this.timeseriesData.set(timeseries);
          // Initialize chart with real data
          setTimeout(() => {
            this.initRevenueChart();
          }, 100);
        },
        error: (error) => {
          console.error('Error loading timeseries data:', error);
        },
      });
  }

  /**
   * Get window days from time range string
   */
  private getWindowDaysFromRange(range: string): number {
    const rangeMap: Record<string, number> = {
      '7D': 7,
      '30D': 30,
      '90D': 90,
      '1Y': 365,
    };
    return rangeMap[range] || 30;
  }

  /**
   * Get bucket type from time range
   */
  private getBucketFromRange(range: string): 'day' | 'week' | 'month' {
    if (range === '7D') return 'day';
    if (range === '30D') return 'day';
    if (range === '90D') return 'week';
    return 'month';
  }

  private initRevenueChart(): void {
    if (typeof Highcharts === 'undefined') {
      console.warn('Highcharts not loaded');
      return;
    }

    const timeseries = this.timeseriesData();
    if (!timeseries) {
      return;
    }

    // Extract data points from timeseries
    const categories = timeseries.series.map(
      (point: AnalyticsTimeseriesPoint) => {
        const date = new Date(point.bucketStart);
        return this.formatDateForChart(date, timeseries.bucket);
      }
    );
    const data = timeseries.series.map(
      (point: AnalyticsTimeseriesPoint) => point.value
    );

    Highcharts.chart('revenue-chart', {
      chart: {
        type: 'area',
        height: 256,
        backgroundColor: 'transparent',
      },
      title: { text: null },
      credits: { enabled: false },
      xAxis: {
        categories: categories,
        gridLineWidth: 0,
        lineWidth: 0,
        tickWidth: 0,
        labels: {
          style: {
            color: '#886A63',
            fontSize: '12px',
          },
        },
      },
      yAxis: {
        title: { text: null },
        gridLineWidth: 1,
        gridLineColor: '#f0f0f0',
        labels: {
          style: {
            color: '#886A63',
            fontSize: '12px',
          },
        },
      },
      plotOptions: {
        area: {
          fillColor: {
            linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
            stops: [
              [0, 'rgba(233, 76, 42, 0.3)'],
              [1, 'rgba(233, 76, 42, 0.05)'],
            ],
          },
          marker: {
            radius: 4,
            fillColor: '#E94C2A',
            lineWidth: 2,
            lineColor: '#ffffff',
          },
          lineWidth: 2,
          lineColor: '#E94C2A',
        },
      },
      series: [
        {
          name: 'Revenue',
          data: data,
          showInLegend: false,
        },
      ],
    });
  }

  /**
   * Format date for chart display based on bucket type
   */
  private formatDateForChart(date: Date, bucket: string): string {
    if (bucket === 'day') {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    } else if (bucket === 'week') {
      return `Week ${this.getWeekNumber(date)}`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      });
    }
  }

  /**
   * Get week number from date
   */
  private getWeekNumber(date: Date): number {
    const d = new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
    );
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  }

  private initDemographicsChart(): void {
    if (typeof Highcharts === 'undefined') {
      console.warn('Highcharts not loaded');
      return;
    }

    Highcharts.chart('demographics-chart', {
      chart: {
        type: 'pie',
        height: 192,
        backgroundColor: 'transparent',
      },
      title: { text: null },
      credits: { enabled: false },
      plotOptions: {
        pie: {
          innerSize: '60%',
          dataLabels: { enabled: false },
          showInLegend: false,
          borderWidth: 0,
        },
      },
      colors: ['#E94C2A', '#E07575', '#886A63'],
      series: [
        {
          data: [
            { name: '18-22', y: 45 },
            { name: '23-25', y: 32 },
            { name: '26+', y: 23 },
          ],
        },
      ],
    });
  }

  setTimeRange(range: string): void {
    this.selectedTimeRange.set(range);
    this.loadAnalyticsData();
  }

  exportData(): void {
    // Implement data export functionality
  }

  getGrowthClass(growth: number): string {
    return growth >= 0 ? 'positive' : 'negative';
  }

  getGrowthIcon(growth: number): string {
    return growth >= 0 ? '+' : '';
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  getProgressBarWidth(percentage: number): string {
    return `${percentage}%`;
  }
}
