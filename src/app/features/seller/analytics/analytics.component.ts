import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
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
  faLink
} from '@fortawesome/free-solid-svg-icons';
import { faInstagram as faInstagramBrand, faFacebook as faFacebookBrand } from '@fortawesome/free-brands-svg-icons';

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
  styleUrls: ['./analytics.component.css']
})
export class AnalyticsComponent implements OnInit {
  
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
    totalRevenue: 24580,
    totalOrders: 1247,
    newCustomers: 892,
    conversionRate: 3.8
  });

  revenueGrowth = signal(12.5);
  ordersGrowth = signal(8.2);
  customersGrowth = signal(15.3);
  conversionGrowth = signal(-2.1);

  selectedTimeRange = '30D';

  topProducts = signal<ProductPerformance[]>([
    {
      name: 'MacBook Pro 16"',
      category: 'Electronics',
      price: 2399,
      growth: 24,
      icon: faLaptop
    },
    {
      name: 'Vintage T-Shirt',
      category: 'Fashion',
      price: 29,
      growth: 18,
      icon: faShirt
    },
    {
      name: 'Study Guide Set',
      category: 'Books',
      price: 45,
      growth: 12,
      icon: faBook
    }
  ]);

  trafficSources = signal<TrafficSource[]>([
    {
      name: 'Instagram',
      percentage: 40,
      icon: faInstagramBrand,
      color: '#E4405F'
    },
    {
      name: 'Organic Search',
      percentage: 30,
      icon: faSearch,
      color: '#3B82F6'
    },
    {
      name: 'Direct',
      percentage: 15,
      icon: faLink,
      color: '#10B981'
    },
    {
      name: 'Facebook',
      percentage: 15,
      icon: faFacebookBrand,
      color: '#1877F2'
    }
  ]);

  inventoryStatus = signal<InventoryStatus[]>([
    {
      status: 'In Stock',
      count: 156,
      color: '#10B981',
      bgColor: '#F0FDF4',
      borderColor: '#BBF7D0'
    },
    {
      status: 'Low Stock',
      count: 23,
      color: '#F59E0B',
      bgColor: '#FFFBEB',
      borderColor: '#FED7AA'
    },
    {
      status: 'Out of Stock',
      count: 8,
      color: '#EF4444',
      bgColor: '#FEF2F2',
      borderColor: '#FECACA'
    }
  ]);

  demographicsData = signal<DemographicsData[]>([
    { ageGroup: '18-22 years', percentage: 45 },
    { ageGroup: '23-25 years', percentage: 32 },
    { ageGroup: '26+ years', percentage: 23 }
  ]);

  ngOnInit(): void {
    // Initialize charts after view init
    setTimeout(() => {
      this.initRevenueChart();
      this.initDemographicsChart();
    }, 100);
  }

  private initRevenueChart(): void {
    if (typeof Highcharts === 'undefined') {
      console.warn('Highcharts not loaded');
      return;
    }

    Highcharts.chart('revenue-chart', {
      chart: { 
        type: 'area', 
        height: 256,
        backgroundColor: 'transparent'
      },
      title: { text: null },
      credits: { enabled: false },
      xAxis: {
        categories: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        gridLineWidth: 0,
        lineWidth: 0,
        tickWidth: 0,
        labels: {
          style: {
            color: '#886A63',
            fontSize: '12px'
          }
        }
      },
      yAxis: {
        title: { text: null },
        gridLineWidth: 1,
        gridLineColor: '#f0f0f0',
        labels: {
          style: {
            color: '#886A63',
            fontSize: '12px'
          }
        }
      },
      plotOptions: {
        area: {
          fillColor: {
            linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
            stops: [
              [0, 'rgba(233, 76, 42, 0.3)'],
              [1, 'rgba(233, 76, 42, 0.05)']
            ]
          },
          marker: { 
            radius: 4,
            fillColor: '#E94C2A',
            lineWidth: 2,
            lineColor: '#ffffff'
          },
          lineWidth: 2,
          lineColor: '#E94C2A'
        }
      },
      series: [{
        name: 'Revenue',
        data: [5200, 6800, 7200, 8400],
        showInLegend: false
      }]
    });
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
        backgroundColor: 'transparent'
      },
      title: { text: null },
      credits: { enabled: false },
      plotOptions: {
        pie: {
          innerSize: '60%',
          dataLabels: { enabled: false },
          showInLegend: false,
          borderWidth: 0
        }
      },
      colors: ['#E94C2A', '#E07575', '#886A63'],
      series: [{
        data: [
          { name: '18-22', y: 45 },
          { name: '23-25', y: 32 },
          { name: '26+', y: 23 }
        ]
      }]
    });
  }

  setTimeRange(range: string): void {
    this.selectedTimeRange = range;
    // Here you would typically reload data based on the selected time range
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
      maximumFractionDigits: 0
    }).format(amount);
  }

  getProgressBarWidth(percentage: number): string {
    return `${percentage}%`;
  }
} 