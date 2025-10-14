/**
 * Application Initializer Service
 * 
 * Orchestrates the initialization sequence for all domain services
 * and the UI state layer.
 * 
 * This service provides a single, predictable entry point for app bootstrap.
 * It ensures services are initialized in the correct order and handles
 * any dependencies between initialization steps.
 * 
 * Call from app.component.ts ngOnInit():
 *   this.appInitializer.init();
 */

import { Injectable, inject } from '@angular/core';
import { AppStateService } from '../state/app-state.ui';

/**
 * Initialization result
 */
export interface InitResult {
  success: boolean;
  timestamp: Date;
  errors: string[];
  warnings: string[];
  duration: number;
}

/**
 * AppInitializerService - Application Bootstrap Orchestrator
 */
@Injectable({
  providedIn: 'root'
})
export class AppInitializerService {
  private appState = inject(AppStateService);
  
  // Domain services will be injected here as they are migrated
  // Example:
  // private authService = inject(AuthService);
  // private cartService = inject(CartService);
  // private notificationService = inject(NotificationService);
  // private realtimeService = inject(RealtimeService);
  
  private isInitialized = false;
  private initPromise: Promise<InitResult> | null = null;
  
  /**
   * Initialize the application
   * 
   * This is idempotent - calling multiple times will return the same promise
   * and only execute initialization once.
   * 
   * @returns Promise that resolves when initialization is complete
   */
  async init(): Promise<InitResult> {
    // Return existing promise if already initializing
    if (this.initPromise) {
      return this.initPromise;
    }
    
    // Already initialized, return cached result
    if (this.isInitialized) {
      return {
        success: true,
        timestamp: new Date(),
        errors: [],
        warnings: ['Application already initialized'],
        duration: 0,
      };
    }
    
    const startTime = performance.now();
    console.log('[AppInitializer] Starting application initialization...');
    
    this.initPromise = this.performInitialization(startTime);
    return this.initPromise;
  }
  
  /**
   * Perform the actual initialization sequence
   */
  private async performInitialization(startTime: number): Promise<InitResult> {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    try {
      // ============================================
      // Phase 1: UI State Layer
      // ============================================
      console.log('[AppInitializer] Phase 1: Initializing UI state...');
      this.appState.initUIState();
      
      // ============================================
      // Phase 2: Core Services (Auth, Config)
      // ============================================
      console.log('[AppInitializer] Phase 2: Initializing core services...');
      
      // TODO: Uncomment once services are migrated
      /*
      try {
        await this.authService.init();
      } catch (error) {
        errors.push(`AuthService init failed: ${error}`);
        console.error('[AppInitializer] Auth init error:', error);
      }
      */
      
      // ============================================
      // Phase 3: Domain Services (depends on auth)
      // ============================================
      console.log('[AppInitializer] Phase 3: Initializing domain services...');
      
      // These can run in parallel since they don't depend on each other
      const domainInitPromises: Promise<void>[] = [
        // this.initCartService(),
        // this.initNotificationService(),
        // this.initChatService(),
      ];
      
      const domainResults = await Promise.allSettled(domainInitPromises);
      
      domainResults.forEach((result, index) => {
        if (result.status === 'rejected') {
          const serviceName = this.getDomainServiceName(index);
          errors.push(`${serviceName} init failed: ${result.reason}`);
          console.error(`[AppInitializer] ${serviceName} init error:`, result.reason);
        }
      });
      
      // ============================================
      // Phase 4: Real-time Connections (optional)
      // ============================================
      console.log('[AppInitializer] Phase 4: Initializing real-time connections...');
      
      // Only connect if user is authenticated
      // TODO: Uncomment once services are available
      /*
      if (this.authService.isAuthenticated()) {
        try {
          await this.realtimeService.connect();
        } catch (error) {
          warnings.push(`Real-time connection failed: ${error}`);
          console.warn('[AppInitializer] Real-time connection warning:', error);
        }
      }
      */
      
      // ============================================
      // Finalization
      // ============================================
      const duration = performance.now() - startTime;
      this.isInitialized = true;
      
      const result: InitResult = {
        success: errors.length === 0,
        timestamp: new Date(),
        errors,
        warnings,
        duration,
      };
      
      if (result.success) {
        console.log(`[AppInitializer] ✅ Initialization complete in ${duration.toFixed(2)}ms`);
      } else {
        console.error(`[AppInitializer] ❌ Initialization completed with ${errors.length} error(s)`);
        errors.forEach(error => console.error(`  - ${error}`));
      }
      
      if (warnings.length > 0) {
        console.warn(`[AppInitializer] ⚠️  ${warnings.length} warning(s):`);
        warnings.forEach(warning => console.warn(`  - ${warning}`));
      }
      
      return result;
      
    } catch (error) {
      const duration = performance.now() - startTime;
      console.error('[AppInitializer] Fatal initialization error:', error);
      
      return {
        success: false,
        timestamp: new Date(),
        errors: [`Fatal error: ${error}`],
        warnings,
        duration,
      };
    }
  }
  
  /**
   * Reset all services (used on logout)
   */
  async reset(): Promise<void> {
    console.log('[AppInitializer] Resetting application state...');
    
    try {
      // Reset UI state
      this.appState.resetUIState();
      
      // Reset domain services
      // TODO: Uncomment once services are migrated
      /*
      this.authService.reset();
      this.cartService.reset();
      this.notificationService.reset();
      this.chatService.reset();
      this.realtimeService.disconnect();
      */
      
      // Reset initialization state
      this.isInitialized = false;
      this.initPromise = null;
      
      console.log('[AppInitializer] ✅ Reset complete');
    } catch (error) {
      console.error('[AppInitializer] ❌ Reset error:', error);
      throw error;
    }
  }
  
  /**
   * Check if app is initialized
   */
  get initialized(): boolean {
    return this.isInitialized;
  }
  
  // ============================================
  // Private Initialization Helpers
  // ============================================
  
  /**
   * Initialize cart service
   */
  private async initCartService(): Promise<void> {
    // TODO: Implement once CartService is available
    // await this.cartService.init();
    return Promise.resolve();
  }
  
  /**
   * Initialize notification service
   */
  private async initNotificationService(): Promise<void> {
    // TODO: Implement once NotificationService is available
    // await this.notificationService.init();
    return Promise.resolve();
  }
  
  /**
   * Initialize chat service
   */
  private async initChatService(): Promise<void> {
    // TODO: Implement once ChatService is available
    // await this.chatService.init();
    return Promise.resolve();
  }
  
  /**
   * Get domain service name by index (for error reporting)
   */
  private getDomainServiceName(index: number): string {
    const services = ['CartService', 'NotificationService', 'ChatService'];
    return services[index] || `Service[${index}]`;
  }
}

/**
 * Example usage in app.component.ts:
 * 
 * ```ts
 * import { Component, inject, OnInit } from '@angular/core';
 * import { AppInitializerService } from '@core-next/init/app-initializer.service';
 * 
 * @Component({
 *   selector: 'app-root',
 *   template: `
 *     @if (initResult && !initResult.success) {
 *       <div class="init-error">
 *         Application failed to initialize. Please refresh the page.
 *       </div>
 *     }
 *     <router-outlet />
 *   `
 * })
 * export class AppComponent implements OnInit {
 *   private initializer = inject(AppInitializerService);
 *   
 *   initResult: InitResult | null = null;
 *   
 *   async ngOnInit() {
 *     this.initResult = await this.initializer.init();
 *     
 *     if (!this.initResult.success) {
 *       console.error('Init errors:', this.initResult.errors);
 *     }
 *   }
 * }
 * ```
 * 
 * Example usage in auth.service.ts (on logout):
 * 
 * ```ts
 * async logout() {
 *   await this.api.logout();
 *   await this.appInitializer.reset();
 *   this.router.navigate(['/landing']);
 * }
 * ```
 */

