export const environment = {
  production: true,
  // In production we must call the real API directly (no dev proxy)
  apiBaseUrl: 'https://test.api.marktcommerce.com/api/v1',
  
  // Optional: Runtime environment overrides
  // These can be set via window.env in index.html for deployment flexibility
  getApiBaseUrl(): string {
    return (window as any).env?.apiBaseUrl || this.apiBaseUrl;
  }
};