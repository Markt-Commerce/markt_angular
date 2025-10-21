export const environment = {
  production: false,
  // In development we rely on the Angular dev-server proxy (proxy.conf.json)
  // to forward /api/v1 to the remote API. Keep this as a relative path.
  apiBaseUrl: '/api/v1',
  
  // Optional: Runtime environment overrides
  // These can be set via window.env in index.html for deployment flexibility
  getApiBaseUrl(): string {
    return (window as any).env?.apiBaseUrl || this.apiBaseUrl;
  }
};