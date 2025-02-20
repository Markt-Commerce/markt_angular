import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withPreloading } from '@angular/router';
import { NetworkAwarePreloadStrategy } from "../app/services/networkPreloader.service";
import { provideHttpClient } from '@angular/common/http';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes,withPreloading(NetworkAwarePreloadStrategy)),provideHttpClient()],
};
