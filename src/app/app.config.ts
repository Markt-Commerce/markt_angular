import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { ServiceWorkerModule } from '@angular/service-worker';

import { routes } from './app.routes';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { GlobalErrorHandler } from './core/services/global-error.handler';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([errorInterceptor])
    ),
    provideAnimations(),
    GlobalErrorHandler,
    importProvidersFrom(
      ServiceWorkerModule.register('ngsw-worker.js', {
        enabled: false, // Disabled for now, can be enabled in production
        registrationStrategy: 'registerWhenStable:30000'
      })
    )
  ]
};
