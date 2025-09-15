import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, RouterLink, ButtonComponent],
  template: `
    <div class="not-found-container">
      <div class="not-found-content">
        <div class="error-code">404</div>
        <h1>Page Not Found</h1>
        <p>The page you're looking for doesn't exist or has been moved.</p>
        
        <div class="actions">
          <app-button 
            variant="primary" 
            size="lg"
            [routerLink]="['/home']"
          >
            Go Home
          </app-button>
          <app-button 
            variant="secondary" 
            size="lg"
            [routerLink]="['/app/marketplace']"
          >
            Browse Marketplace
          </app-button>
        </div>

        <div class="helpful-links">
          <h3>Popular Pages</h3>
          <div class="links-grid">
            <a routerLink="/app/marketplace" class="helpful-link">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9,22 9,12 15,12 15,22"></polyline>
              </svg>
              Marketplace
            </a>
            <a routerLink="/app/community" class="helpful-link">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
              Community
            </a>
            <a routerLink="/auth/login" class="helpful-link">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                <polyline points="10,17 15,12 10,7"></polyline>
                <line x1="15" y1="12" x2="3" y2="12"></line>
              </svg>
              Sign In
            </a>
            <a routerLink="/auth/register" class="helpful-link">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="8.5" cy="7" r="4"></circle>
                <line x1="20" y1="8" x2="20" y2="14"></line>
                <line x1="23" y1="11" x2="17" y2="11"></line>
              </svg>
              Create Account
            </a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .not-found-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem 1rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .not-found-content {
      background: white;
      border-radius: 16px;
      padding: 3rem 2rem;
      text-align: center;
      max-width: 600px;
      width: 100%;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    }

    .error-code {
      font-size: 8rem;
      font-weight: 900;
      color: #3b82f6;
      line-height: 1;
      margin-bottom: 1rem;
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
    }

    h1 {
      font-size: 2.5rem;
      font-weight: 700;
      color: #1f2937;
      margin-bottom: 1rem;
    }

    p {
      font-size: 1.125rem;
      color: #6b7280;
      margin-bottom: 2rem;
      line-height: 1.6;
    }

    .actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
      margin-bottom: 3rem;
      flex-wrap: wrap;
    }

    .helpful-links {
      border-top: 1px solid #e5e7eb;
      padding-top: 2rem;
    }

    .helpful-links h3 {
      font-size: 1.25rem;
      font-weight: 600;
      color: #374151;
      margin-bottom: 1rem;
    }

    .links-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }

    .helpful-link {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      text-decoration: none;
      color: #374151;
      transition: all 0.2s;
      background: #f9fafb;
    }

    .helpful-link:hover {
      background: #f3f4f6;
      border-color: #d1d5db;
      transform: translateY(-1px);
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }

    .helpful-link svg {
      color: #6b7280;
    }

    /* Responsive */
    @media (max-width: 640px) {
      .not-found-content {
        padding: 2rem 1rem;
      }

      .error-code {
        font-size: 6rem;
      }

      h1 {
        font-size: 2rem;
      }

      .actions {
        flex-direction: column;
        align-items: center;
      }

      .links-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class NotFoundComponent {
  // 404 page component
} 