import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ButtonComponent } from '../../shared/components/button/button.component';

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [CommonModule, RouterLink, ButtonComponent],
  template: `
    <div class="onboarding-container">
      <div class="onboarding-content">
        <div class="onboarding-header">
          <h1>Welcome to Markt!</h1>
          <p>Let's get you started with your account</p>
        </div>

        <div class="onboarding-steps">
          <div class="step">
            <div class="step-number">1</div>
            <div class="step-content">
              <h3>Create Your Account</h3>
              <p>Sign up with your email and create a secure password</p>
            </div>
          </div>

          <div class="step">
            <div class="step-number">2</div>
            <div class="step-content">
              <h3>Complete Your Profile</h3>
              <p>Add your personal information and profile picture</p>
            </div>
          </div>

          <div class="step">
            <div class="step-number">3</div>
            <div class="step-content">
              <h3>Start Exploring</h3>
              <p>Browse the marketplace and discover amazing products</p>
            </div>
          </div>
        </div>

        <div class="onboarding-actions">
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
            [routerLink]="['/auth/login']"
          >
            I Already Have an Account
          </app-button>
        </div>

        <div class="onboarding-features">
          <h3>What you can do on Markt:</h3>
          <ul class="features-list">
            <li>Buy and sell products in a secure environment</li>
            <li>Connect with local buyers and sellers</li>
            <li>Join community discussions and get recommendations</li>
            <li>Track your orders and manage your listings</li>
          </ul>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .onboarding-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
    }

    .onboarding-content {
      background: white;
      border-radius: 16px;
      padding: 3rem;
      max-width: 600px;
      width: 100%;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
    }

    .onboarding-header {
      text-align: center;
      margin-bottom: 3rem;
    }

    .onboarding-header h1 {
      font-size: 2.5rem;
      font-weight: 700;
      color: #1f2937;
      margin-bottom: 1rem;
    }

    .onboarding-header p {
      font-size: 1.125rem;
      color: #6b7280;
    }

    .onboarding-steps {
      margin-bottom: 3rem;
    }

    .step {
      display: flex;
      align-items: flex-start;
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .step:last-child {
      margin-bottom: 0;
    }

    .step-number {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: #3b82f6;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 1.125rem;
      flex-shrink: 0;
    }

    .step-content h3 {
      font-size: 1.25rem;
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 0.5rem;
    }

    .step-content p {
      color: #6b7280;
      line-height: 1.6;
    }

    .onboarding-actions {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-bottom: 3rem;
    }

    .onboarding-features h3 {
      font-size: 1.25rem;
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 1rem;
    }

    .features-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .features-list li {
      padding: 0.5rem 0;
      color: #6b7280;
      position: relative;
      padding-left: 1.5rem;
    }

    .features-list li::before {
      content: '✓';
      position: absolute;
      left: 0;
      color: #10b981;
      font-weight: 600;
    }

    @media (max-width: 768px) {
      .onboarding-content {
        padding: 2rem;
      }

      .onboarding-header h1 {
        font-size: 2rem;
      }
    }
  `]
})
export class OnboardingComponent {
  // Onboarding component for new user introduction
} 