import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app';
import { isDevMode } from '@angular/core';

if (!isDevMode()) {
	// Silence verbose logs in production; keep errors/warnings
	console.log = () => {};
	console.debug = () => {};
}

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
