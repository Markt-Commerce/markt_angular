import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface SalesData {
  date: string;
  sales: number;
  orders: number;
  revenue: number;
  profit: number;
}

export interface TrendData {
  period: string;
  value: number;
  change: number;
  changeType: 'increase' | 'decrease' | 'neutral';
}

@Component({
  selector: 'app-sales-trends',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sales-trends.component.html',
  styleUrl: './sales-trends.component.css',
})
export class SalesTrendsComponent implements OnInit {
  @Input() salesData: SalesData[] = [];
  @Input() timeRange: '7d' | '30d' | '90d' | '1y' = '30d';
  @Input() loading = false;
  @Output() timeRangeChange = new EventEmitter<'7d' | '30d' | '90d' | '1y'>();
  @Output() dataPointClick = new EventEmitter<SalesData>();

  trends: TrendData[] = [];
  selectedMetric: 'sales' | 'revenue' | 'profit' = 'revenue';
  chartData: { date: string; value: number }[] = [];

  ngOnInit() {
    this.calculateTrends();
    this.updateChartData();
  }

  ngOnChanges() {
    this.calculateTrends();
    this.updateChartData();
  }

  calculateTrends() {
    if (this.salesData.length === 0) return;

    const currentPeriod = this.getCurrentPeriodData();
    const previousPeriod = this.getPreviousPeriodData();

    this.trends = [
      {
        period: 'Sales',
        value: this.sumData(currentPeriod, 'sales'),
        change: this.calculateChange(currentPeriod, previousPeriod, 'sales'),
        changeType: this.getChangeType(currentPeriod, previousPeriod, 'sales'),
      },
      {
        period: 'Revenue',
        value: this.sumData(currentPeriod, 'revenue'),
        change: this.calculateChange(currentPeriod, previousPeriod, 'revenue'),
        changeType: this.getChangeType(
          currentPeriod,
          previousPeriod,
          'revenue'
        ),
      },
      {
        period: 'Profit',
        value: this.sumData(currentPeriod, 'profit'),
        change: this.calculateChange(currentPeriod, previousPeriod, 'profit'),
        changeType: this.getChangeType(currentPeriod, previousPeriod, 'profit'),
      },
    ];
  }

  updateChartData() {
    this.chartData = this.salesData.map((item) => ({
      date: item.date,
      value: item[this.selectedMetric],
    }));
  }

  getCurrentPeriodData(): SalesData[] {
    const days = this.getDaysFromRange();
    return this.salesData.slice(-days);
  }

  getPreviousPeriodData(): SalesData[] {
    const days = this.getDaysFromRange();
    const startIndex = this.salesData.length - days * 2;
    const endIndex = this.salesData.length - days;
    return this.salesData.slice(startIndex, endIndex);
  }

  getDaysFromRange(): number {
    switch (this.timeRange) {
      case '7d':
        return 7;
      case '30d':
        return 30;
      case '90d':
        return 90;
      case '1y':
        return 365;
      default:
        return 30;
    }
  }

  sumData(data: SalesData[], metric: keyof SalesData): number {
    return data.reduce((sum, item) => sum + (item[metric] as number), 0);
  }

  calculateChange(
    current: SalesData[],
    previous: SalesData[],
    metric: keyof SalesData
  ): number {
    const currentSum = this.sumData(current, metric);
    const previousSum = this.sumData(previous, metric);

    if (previousSum === 0) return 0;
    return ((currentSum - previousSum) / previousSum) * 100;
  }

  getChangeType(
    current: SalesData[],
    previous: SalesData[],
    metric: keyof SalesData
  ): 'increase' | 'decrease' | 'neutral' {
    const change = this.calculateChange(current, previous, metric);
    if (change > 0) return 'increase';
    if (change < 0) return 'decrease';
    return 'neutral';
  }

  onTimeRangeChange(range: '7d' | '30d' | '90d' | '1y') {
    this.timeRange = range;
    this.timeRangeChange.emit(range);
    this.calculateTrends();
    this.updateChartData();
  }

  onMetricChange(metric: 'sales' | 'revenue' | 'profit') {
    this.selectedMetric = metric;
    this.updateChartData();
  }

  onDataPointClick(data: SalesData) {
    this.dataPointClick.emit(data);
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }

  formatNumber(value: number): string {
    return new Intl.NumberFormat('en-US').format(value);
  }

  formatPercentage(value: number): string {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  }

  getMaxValue(): number {
    return Math.max(...this.chartData.map((item) => item.value));
  }

  getChartHeight(value: number): string {
    const maxValue = this.getMaxValue();
    if (maxValue === 0) return '0%';
    return `${(value / maxValue) * 100}%`;
  }

  getAverageValue(): number {
    if (this.chartData.length === 0) return 0;
    const sum = this.chartData.reduce((acc, item) => acc + item.value, 0);
    return sum / this.chartData.length;
  }

  getBestPerformingMetric(): string {
    if (this.trends.length === 0) return 'No data available';
    const bestTrend = this.trends.reduce((best, current) =>
      current.change > best.change ? current : best
    );
    return `${bestTrend.period} (${this.formatPercentage(bestTrend.change)})`;
  }

  getGrowthRate(): string {
    if (this.trends.length === 0) return 'No data available';
    const avgChange =
      this.trends.reduce((sum, trend) => sum + trend.change, 0) /
      this.trends.length;
    return this.formatPercentage(avgChange);
  }

  getTrendDirection(): string {
    if (this.trends.length === 0) return 'No data available';
    const positiveTrends = this.trends.filter(
      (trend) => trend.changeType === 'increase'
    ).length;
    const negativeTrends = this.trends.filter(
      (trend) => trend.changeType === 'decrease'
    ).length;

    if (positiveTrends > negativeTrends) return 'Upward trend';
    if (negativeTrends > positiveTrends) return 'Downward trend';
    return 'Stable trend';
  }
}
