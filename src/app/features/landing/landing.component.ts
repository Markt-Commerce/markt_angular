import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ButtonComponent } from '../../shared/components/button/button.component';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink, ButtonComponent],
  template: `
    <div class="landing-container">
      <!-- Hero Section -->
      <section class="hero-section">
        <div class="hero-content">
          <h1 class="hero-title">
            Welcome to <span class="highlight">Markt</span>
          </h1>
          <p class="hero-subtitle">
            The social-first e-commerce platform where buying and selling meets community
          </p>
          <div class="hero-actions">
            <app-button 
              variant="primary" 
              size="lg" 
              [routerLink]="['/auth/register']"
            >
              Get Started
            </app-button>
            <app-button 
              variant="secondary" 
              size="lg" 
              [routerLink]="['/app/marketplace']"
            >
              Browse Marketplace
            </app-button>
          </div>
        </div>
        <div class="hero-image">
          <img src="/assets/hero-image.jpg" alt="Markt Marketplace" class="hero-img">
        </div>
      </section>

      <!-- Features Section -->
      <section class="features-section">
        <h2 class="section-title">Why Choose Markt?</h2>
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            <h3>Social Commerce</h3>
            <p>Connect with buyers and sellers in a vibrant community</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
            </div>
            <h3>Secure Transactions</h3>
            <p>Safe and secure payment processing for all transactions</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            </div>
            <h3>Local Discovery</h3>
            <p>Find amazing products and deals in your local area</p>
          </div>
        </div>
      </section>

      <!-- CTA Section -->
      <section class="cta-section">
        <div class="cta-content">
          <h2>Ready to Start?</h2>
          <p>Join thousands of users buying and selling on Markt</p>
          <app-button 
            variant="primary" 
            size="lg" 
            [routerLink]="['/auth/register']"
          >
            Create Account
          </app-button>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .landing-container {
      min-height: 100vh;
    }

    /* Hero Section */
    .hero-section {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 4rem;
      align-items: center;
      padding: 4rem 2rem;
      max-width: 1200px;
      margin: 0 auto;
      min-height: 80vh;
    }

    .hero-content {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .hero-title {
      font-size: 3.5rem;
      font-weight: 700;
      color: #1f2937;
      line-height: 1.2;
    }

    .highlight {
      color: #3b82f6;
    }

    .hero-subtitle {
      font-size: 1.25rem;
      color: #6b7280;
      line-height: 1.6;
    }

    .hero-actions {
      display: flex;
      gap: 1rem;
    }

    .hero-image {
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .hero-img {
      width: 100%;
      max-width: 500px;
      height: auto;
      border-radius: 12px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
    }

    /* Features Section */
    .features-section {
      padding: 4rem 2rem;
      background: #f9fafb;
    }

    .section-title {
      text-align: center;
      font-size: 2.5rem;
      font-weight: 700;
      color: #1f2937;
      margin-bottom: 3rem;
    }

    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .feature-card {
      background: white;
      padding: 2rem;
      border-radius: 12px;
      text-align: center;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      transition: transform 0.2s;
    }

    .feature-card:hover {
      transform: translateY(-4px);
    }

    .feature-icon {
      color: #3b82f6;
      margin-bottom: 1rem;
    }

    .feature-card h3 {
      font-size: 1.5rem;
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 1rem;
    }

    .feature-card p {
      color: #6b7280;
      line-height: 1.6;
    }

    /* CTA Section */
    .cta-section {
      padding: 4rem 2rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      text-align: center;
    }

    .cta-content {
      max-width: 600px;
      margin: 0 auto;
    }

    .cta-content h2 {
      font-size: 2.5rem;
      font-weight: 700;
      margin-bottom: 1rem;
    }

    .cta-content p {
      font-size: 1.25rem;
      margin-bottom: 2rem;
      opacity: 0.9;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .hero-section {
        grid-template-columns: 1fr;
        gap: 2rem;
        padding: 2rem 1rem;
      }

      .hero-title {
        font-size: 2.5rem;
      }

      .hero-actions {
        flex-direction: column;
      }

      .features-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class LandingComponent {
  // Landing page component for the main entry point
} 