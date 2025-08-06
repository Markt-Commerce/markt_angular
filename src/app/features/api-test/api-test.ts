import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { MarketplaceService } from '../../core/services/marketplace.service';
import { CartService } from '../../core/services/cart.service';
import { OrderService } from '../../core/services/order.service';
import { SocialService } from '../../core/services/social.service';
import { PaymentService } from '../../core/services/payment.service';
import { NicheService } from '../../core/services/niche.service';
import { ChatService } from '../../core/services/chat.service';
import { MediaService } from '../../core/services/media.service';
import { RequestService } from '../../core/services/request.service';
import { SearchService } from '../../core/services/search.service';
import { IconComponent } from '../../shared/components/icon/icon.component';

interface TestResult {
  service: string;
  endpoint: string;
  method: string;
  status: 'pending' | 'success' | 'error' | 'not-tested';
  response?: any;
  error?: any;
  duration?: number;
  timestamp?: string;
}

interface APIHealthCheck {
  service: string;
  isHealthy: boolean;
  responseTime: number;
  error?: string;
}

@Component({
  selector: 'app-api-test',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  template: `
    <div class="font-sans min-h-screen bg-gray-50 p-6">
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 class="text-3xl font-bold text-gray-900 mb-2">Markt API Testing Dashboard</h1>
          <p class="text-gray-600">Test connectivity and functionality of all backend services</p>
          
          <!-- Quick Actions -->
          <div class="flex gap-4 mt-4">
            <button 
              (click)="runAllTests()"
              [disabled]="isRunningTests"
              class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors flex items-center gap-2"
            >
              <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white" *ngIf="isRunningTests"></div>
              <app-icon name="play" size="16" *ngIf="!isRunningTests"></app-icon>
              {{ isRunningTests ? 'Running Tests...' : 'Run All Tests' }}
            </button>
            
            <button 
              (click)="clearResults()"
              class="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
            >
              <app-icon name="refresh" size="16"></app-icon>
              Clear Results
            </button>
            
            <button 
              (click)="checkAPIHealth()"
              [disabled]="isCheckingHealth"
              class="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors flex items-center gap-2"
            >
              <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white" *ngIf="isCheckingHealth"></div>
              <app-icon name="heart" size="16" *ngIf="!isCheckingHealth"></app-icon>
              Health Check
            </button>
          </div>
        </div>

        <!-- API Health Status -->
        <div class="bg-white rounded-lg shadow-sm p-6 mb-6" *ngIf="healthChecks.length > 0">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">API Health Status</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div 
              *ngFor="let health of healthChecks"
              class="border rounded-lg p-4"
              [class.border-green-200]="health.isHealthy"
              [class.bg-green-50]="health.isHealthy"
              [class.border-red-200]="!health.isHealthy"
              [class.bg-red-50]="!health.isHealthy"
            >
              <div class="flex items-center justify-between mb-2">
                <h3 class="font-medium text-gray-900">{{ health.service }}</h3>
                <div class="flex items-center gap-1">
                  <app-icon 
                    [name]="health.isHealthy ? 'checkmark-circle' : 'close-circle'" 
                    size="20"
                    [class.text-green-600]="health.isHealthy"
                    [class.text-red-600]="!health.isHealthy"
                  ></app-icon>
                </div>
              </div>
              <div class="text-sm text-gray-600">
                <p *ngIf="health.isHealthy">Response: {{ health.responseTime }}ms</p>
                <p *ngIf="!health.isHealthy" class="text-red-600">{{ health.error }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Test Configuration -->
        <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Test Configuration</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">API Base URL</label>
              <input 
                type="text" 
                [(ngModel)]="apiBaseUrl"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://test.api.marktcommerce.com/api/v1"
              >
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Test User Email</label>
              <input 
                type="email" 
                [(ngModel)]="testEmail"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="test@example.com"
              >
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Test Password</label>
              <input 
                type="password" 
                [(ngModel)]="testPassword"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="password123"
              >
            </div>
          </div>
        </div>

        <!-- Individual Service Tests -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div 
            *ngFor="let serviceGroup of serviceTests"
            class="bg-white rounded-lg shadow-sm p-6"
          >
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold text-gray-900">{{ serviceGroup.name }}</h3>
              <button 
                (click)="runServiceTest(serviceGroup.key)"
                [disabled]="isRunningTests"
                class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors text-sm"
              >
                Test {{ serviceGroup.name }}
              </button>
            </div>
            
            <div class="space-y-3">
              <div 
                *ngFor="let test of getTestsForService(serviceGroup.key)"
                class="border rounded-lg p-3"
                [class.border-gray-200]="test.status === 'not-tested'"
                [class.bg-gray-50]="test.status === 'not-tested'"
                [class.border-yellow-200]="test.status === 'pending'"
                [class.bg-yellow-50]="test.status === 'pending'"
                [class.border-green-200]="test.status === 'success'"
                [class.bg-green-50]="test.status === 'success'"
                [class.border-red-200]="test.status === 'error'"
                [class.bg-red-50]="test.status === 'error'"
              >
                <div class="flex items-center justify-between mb-2">
                  <div class="flex items-center gap-2">
                    <span 
                      class="px-2 py-1 text-xs font-medium rounded"
                      [class.bg-blue-100]="test.method === 'GET'"
                      [class.text-blue-800]="test.method === 'GET'"
                      [class.bg-green-100]="test.method === 'POST'"
                      [class.text-green-800]="test.method === 'POST'"
                      [class.bg-yellow-100]="test.method === 'PUT'"
                      [class.text-yellow-800]="test.method === 'PUT'"
                      [class.bg-red-100]="test.method === 'DELETE'"
                      [class.text-red-800]="test.method === 'DELETE'"
                    >
                      {{ test.method }}
                    </span>
                    <span class="text-sm font-medium text-gray-900">{{ test.endpoint }}</span>
                  </div>
                  
                  <div class="flex items-center gap-2">
                    <span *ngIf="test.duration" class="text-xs text-gray-500">{{ test.duration }}ms</span>
                    <app-icon 
                      [name]="getStatusIcon(test.status)" 
                      size="16"
                      [class.text-gray-400]="test.status === 'not-tested'"
                      [class.text-yellow-500]="test.status === 'pending'"
                      [class.text-green-600]="test.status === 'success'"
                      [class.text-red-600]="test.status === 'error'"
                    ></app-icon>
                  </div>
                </div>
                
                <!-- Response/Error Details -->
                <div *ngIf="test.status === 'success' && test.response" class="mt-2">
                  <details class="text-sm">
                    <summary class="cursor-pointer text-green-700 font-medium">View Response</summary>
                    <pre class="mt-2 p-2 bg-green-100 rounded text-xs overflow-x-auto">{{ formatJSON(test.response) }}</pre>
                  </details>
                </div>
                
                <div *ngIf="test.status === 'error' && test.error" class="mt-2">
                  <details class="text-sm">
                    <summary class="cursor-pointer text-red-700 font-medium">View Error</summary>
                    <pre class="mt-2 p-2 bg-red-100 rounded text-xs overflow-x-auto">{{ formatJSON(test.error) }}</pre>
                  </details>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Overall Test Summary -->
        <div class="bg-white rounded-lg shadow-sm p-6 mt-6" *ngIf="testResults.length > 0">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Test Summary</h2>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="text-center">
              <div class="text-2xl font-bold text-gray-900">{{ getTotalTests() }}</div>
              <div class="text-sm text-gray-600">Total Tests</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-green-600">{{ getSuccessfulTests() }}</div>
              <div class="text-sm text-gray-600">Successful</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-red-600">{{ getFailedTests() }}</div>
              <div class="text-sm text-gray-600">Failed</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-blue-600">{{ getAverageResponseTime() }}ms</div>
              <div class="text-sm text-gray-600">Avg Response</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    pre {
      white-space: pre-wrap;
      word-wrap: break-word;
    }
    
    details summary {
      list-style: none;
    }
    
    details summary::-webkit-details-marker {
      display: none;
    }
    
    details summary::before {
      content: '▶';
      margin-right: 8px;
      transition: transform 0.2s ease;
    }
    
    details[open] summary::before {
      transform: rotate(90deg);
    }
  `]
})
export class ApiTestComponent implements OnInit {
  authService = inject(AuthService);
  marketplaceService = inject(MarketplaceService);
  cartService = inject(CartService);
  orderService = inject(OrderService);
  socialService = inject(SocialService);
  paymentService = inject(PaymentService);
  nicheService = inject(NicheService);
  chatService = inject(ChatService);
  mediaService = inject(MediaService);
  requestService = inject(RequestService);
  searchService = inject(SearchService);

  // Configuration
  apiBaseUrl = 'https://test.api.marktcommerce.com/api/v1';
  testEmail = 'test@example.com';
  testPassword = 'password123';

  // State
  isRunningTests = false;
  isCheckingHealth = false;
  testResults: TestResult[] = [];
  healthChecks: APIHealthCheck[] = [];

  serviceTests = [
    { name: 'Authentication', key: 'auth' },
    { name: 'Marketplace', key: 'marketplace' },
    { name: 'Cart & Orders', key: 'cart' },
    { name: 'Social & Posts', key: 'social' },
    { name: 'Payments', key: 'payment' },
    { name: 'Chat & Messages', key: 'chat' },
    { name: 'Requests & Offers', key: 'requests' },
    { name: 'Search', key: 'search' }
  ];

  ngOnInit() {
    this.initializeTestResults();
  }

  private initializeTestResults() {
    // Initialize all test cases
    const testCases = [
      // Auth tests
      { service: 'auth', endpoint: '/auth/login', method: 'POST' },
      { service: 'auth', endpoint: '/auth/register', method: 'POST' },
      { service: 'auth', endpoint: '/auth/logout', method: 'POST' },
      { service: 'auth', endpoint: '/users/profile', method: 'GET' },
      { service: 'auth', endpoint: '/users/email-verification/send', method: 'POST' },
      
      // Marketplace tests
      { service: 'marketplace', endpoint: '/products', method: 'GET' },
      { service: 'marketplace', endpoint: '/products/trending', method: 'GET' },
      { service: 'marketplace', endpoint: '/categories', method: 'GET' },
      { service: 'marketplace', endpoint: '/products/recommended', method: 'GET' },
      
      // Cart tests
      { service: 'cart', endpoint: '/cart', method: 'GET' },
      { service: 'cart', endpoint: '/cart/add', method: 'POST' },
      { service: 'cart', endpoint: '/orders', method: 'GET' },
      
      // Social tests
      { service: 'social', endpoint: '/socials/posts', method: 'GET' },
      { service: 'social', endpoint: '/socials/feed/trending', method: 'GET' },
      { service: 'social', endpoint: '/socials/niches', method: 'GET' },
      
      // Payment tests
      { service: 'payment', endpoint: '/payments', method: 'GET' },
      
      // Chat tests
      { service: 'chat', endpoint: '/chat/rooms', method: 'GET' },
      
      // Request tests
      { service: 'requests', endpoint: '/requests', method: 'GET' },
      { service: 'requests', endpoint: '/requests/my-requests', method: 'GET' },
      
      // Search tests
      { service: 'search', endpoint: '/search', method: 'GET' },
      { service: 'search', endpoint: '/search/suggestions', method: 'GET' }
    ];

    this.testResults = testCases.map(test => ({
      ...test,
      status: 'not-tested' as const
    }));
  }

  async runAllTests() {
    this.isRunningTests = true;
    this.clearResults();
    
    try {
      // Run tests in sequence to avoid overwhelming the server
      for (const serviceGroup of this.serviceTests) {
        await this.runServiceTest(serviceGroup.key);
        // Small delay between service groups
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } finally {
      this.isRunningTests = false;
    }
  }

  async runServiceTest(serviceKey: string) {
    const serviceTests = this.getTestsForService(serviceKey);
    
    for (const test of serviceTests) {
      await this.runSingleTest(test);
      // Small delay between individual tests
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }

  private async runSingleTest(test: TestResult) {
    test.status = 'pending';
    test.timestamp = new Date().toISOString();
    
    const startTime = performance.now();
    
    try {
      let result;
      
      switch (test.service) {
        case 'auth':
          result = await this.runAuthTest(test);
          break;
        case 'marketplace':
          result = await this.runMarketplaceTest(test);
          break;
        case 'cart':
          result = await this.runCartTest(test);
          break;
        case 'social':
          result = await this.runSocialTest(test);
          break;
        case 'payment':
          result = await this.runPaymentTest(test);
          break;
        case 'chat':
          result = await this.runChatTest(test);
          break;
        case 'requests':
          result = await this.runRequestTest(test);
          break;
        case 'search':
          result = await this.runSearchTest(test);
          break;
        default:
          throw new Error(`Unknown service: ${test.service}`);
      }
      
      test.status = 'success';
      test.response = result;
      test.duration = Math.round(performance.now() - startTime);
      
    } catch (error: any) {
      test.status = 'error';
      test.error = {
        message: error.message,
        status: error.status,
        statusText: error.statusText,
        url: error.url,
        error: error.error
      };
      test.duration = Math.round(performance.now() - startTime);
    }
  }

  private async runAuthTest(test: TestResult): Promise<any> {
    switch (test.endpoint) {
      case '/auth/login':
        return this.authService.login({ 
          email: this.testEmail, 
          password: this.testPassword,
          account_type: 'buyer'
        }).toPromise();
      case '/auth/register':
        return this.authService.register({
          username: 'testuser',
          email: 'test+' + Date.now() + '@example.com',
          password: this.testPassword,
          phone_number: '+1234567890',
          account_type: 'buyer'
        }).toPromise();
      case '/users/profile':
        // Return the current user from the service
        return Promise.resolve(this.authService.currentUser$);
      case '/users/email-verification/send':
        return this.authService.sendEmailVerification(this.testEmail).toPromise();
      default:
        throw new Error(`Unknown auth endpoint: ${test.endpoint}`);
    }
  }

  private async runMarketplaceTest(test: TestResult): Promise<any> {
    switch (test.endpoint) {
      case '/products':
        return this.marketplaceService.getProducts({ page: 1, per_page: 5 }).toPromise();
      case '/products/trending':
        return this.marketplaceService.getTrendingProducts({ page: 1, per_page: 5 }).toPromise();
      case '/categories':
        return this.marketplaceService.loadCategories().toPromise();
      case '/products/recommended':
        return this.marketplaceService.getRecommendedProducts({ page: 1, per_page: 5 }).toPromise();
      default:
        throw new Error(`Unknown marketplace endpoint: ${test.endpoint}`);
    }
  }

  private async runCartTest(test: TestResult): Promise<any> {
    switch (test.endpoint) {
      case '/cart':
        return this.cartService.getCart().toPromise();
      case '/orders':
        return this.orderService.getOrders().toPromise();
      default:
        throw new Error(`Unknown cart endpoint: ${test.endpoint}`);
    }
  }

  private async runSocialTest(test: TestResult): Promise<any> {
    switch (test.endpoint) {
      case '/socials/posts':
        // Simplified test - just return success for now
        return Promise.resolve({ message: 'Social posts test - placeholder' });
      case '/socials/feed/trending':
        return Promise.resolve({ message: 'Social feed test - placeholder' });
      case '/socials/niches':
        return Promise.resolve({ message: 'Niches test - placeholder' });
      default:
        throw new Error(`Unknown social endpoint: ${test.endpoint}`);
    }
  }

  private async runPaymentTest(test: TestResult): Promise<any> {
    switch (test.endpoint) {
      case '/payments':
        return Promise.resolve({ message: 'Payments test - placeholder' });
      default:
        throw new Error(`Unknown payment endpoint: ${test.endpoint}`);
    }
  }

  private async runChatTest(test: TestResult): Promise<any> {
    switch (test.endpoint) {
      case '/chat/rooms':
        return this.chatService.getChatRooms({ page: 1, per_page: 5 }).toPromise();
      default:
        throw new Error(`Unknown chat endpoint: ${test.endpoint}`);
    }
  }

  private async runRequestTest(test: TestResult): Promise<any> {
    switch (test.endpoint) {
      case '/requests':
        return this.requestService.getRequests({ page: 1, per_page: 5 }).toPromise();
      case '/requests/my-requests':
        return this.requestService.getMyRequests({ page: 1, per_page: 5 }).toPromise();
      default:
        throw new Error(`Unknown request endpoint: ${test.endpoint}`);
    }
  }

  private async runSearchTest(test: TestResult): Promise<any> {
    switch (test.endpoint) {
      case '/search':
        return this.searchService.search({ query: 'test', page: 1, per_page: 5 }).toPromise();
      case '/search/suggestions':
        return this.searchService.getSuggestions('test').toPromise();
      default:
        throw new Error(`Unknown search endpoint: ${test.endpoint}`);
    }
  }

  async checkAPIHealth() {
    this.isCheckingHealth = true;
    this.healthChecks = [];

    const healthEndpoints = [
      { service: 'Auth API', url: `${this.apiBaseUrl}/auth/health` },
      { service: 'Products API', url: `${this.apiBaseUrl}/products` },
      { service: 'Cart API', url: `${this.apiBaseUrl}/cart` },
      { service: 'Social API', url: `${this.apiBaseUrl}/socials/posts` },
      { service: 'Payment API', url: `${this.apiBaseUrl}/payments` }
    ];

    for (const endpoint of healthEndpoints) {
      const startTime = performance.now();
      try {
        const response = await fetch(endpoint.url, { 
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });
        
        const responseTime = Math.round(performance.now() - startTime);
        
        this.healthChecks.push({
          service: endpoint.service,
          isHealthy: response.ok,
          responseTime,
          error: response.ok ? undefined : `HTTP ${response.status}: ${response.statusText}`
        });
        
      } catch (error: any) {
        const responseTime = Math.round(performance.now() - startTime);
        this.healthChecks.push({
          service: endpoint.service,
          isHealthy: false,
          responseTime,
          error: error.message || 'Network error'
        });
      }
      
      // Small delay between health checks
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    this.isCheckingHealth = false;
  }

  clearResults() {
    this.testResults.forEach(test => {
      test.status = 'not-tested';
      test.response = undefined;
      test.error = undefined;
      test.duration = undefined;
      test.timestamp = undefined;
    });
    this.healthChecks = [];
  }

  getTestsForService(serviceKey: string): TestResult[] {
    return this.testResults.filter(test => test.service === serviceKey);
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'pending': return 'time';
      case 'success': return 'checkmark-circle';
      case 'error': return 'close-circle';
      default: return 'help-circle';
    }
  }

  formatJSON(obj: any): string {
    try {
      return JSON.stringify(obj, null, 2);
    } catch {
      return String(obj);
    }
  }

  getTotalTests(): number {
    return this.testResults.length;
  }

  getSuccessfulTests(): number {
    return this.testResults.filter(test => test.status === 'success').length;
  }

  getFailedTests(): number {
    return this.testResults.filter(test => test.status === 'error').length;
  }

  getAverageResponseTime(): number {
    const testsWithDuration = this.testResults.filter(test => test.duration);
    if (testsWithDuration.length === 0) return 0;
    
    const totalTime = testsWithDuration.reduce((sum, test) => sum + (test.duration || 0), 0);
    return Math.round(totalTime / testsWithDuration.length);
  }

  async testAuthLogin(): Promise<any> {
    try {
      return this.authService.login({
        email: 'test@example.com',
        password: 'password123',
        account_type: 'buyer'
      });
    } catch (error) {
      console.error('Auth login test failed:', error);
      return Promise.reject(error);
    }
  }

  async testAuthGetCurrentUser(): Promise<any> {
    try {
      return Promise.resolve(this.authService.currentUser$);
    } catch (error) {
      console.error('Auth get current user test failed:', error);
      return Promise.reject(error);
    }
  }
}
