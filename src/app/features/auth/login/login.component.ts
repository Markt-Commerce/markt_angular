import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  // Form data
  loginData = {
    email: '',
    password: '',
    rememberMe: false
  };

  // UI state
  isLoading = false;
  showPassword = false;

  // Form validation
  errors: { [key: string]: string } = {};

  // Digital Ethnography: Security insights and trust indicators for Nigerian context
  securityInsights = {
    lastLoginAttempt: null as Date | null,
    failedAttempts: 0,
    accountLockout: false,
    suspiciousActivity: false
  };

  // Digital Ethnography: Community insights for returning Nigerian users
  communityInsights = {
    activeUsers: '1,247',
    newMessages: '8',
    pendingTransactions: '2',
    communityUpdates: '3'
  };

  // Digital Ethnography: Behavioral tracking
  userBehavior = {
    loginStartTime: Date.now(),
    fieldInteractions: [] as string[],
    validationAttempts: 0,
    sessionDuration: 0
  };

  constructor(private router: Router) {
    this.trackBehavior('login_page_loaded');
    this.loadUserPreferences();
  }

  // Navigation
  onLogin() {
    if (this.validateForm()) {
      this.isLoading = true;
      this.trackBehavior('login_attempted', {
        email: this.loginData.email,
        rememberMe: this.loginData.rememberMe,
        timeSpent: (Date.now() - this.userBehavior.loginStartTime) / 1000
      });
      
      // TODO: Implement login logic
      console.log('Login attempt:', this.loginData);
      setTimeout(() => {
        this.isLoading = false;
        this.trackBehavior('login_successful', {
          sessionId: this.generateSessionId()
        });
        // Navigate to main app after successful login
        this.router.navigate(['/app/feed']);
      }, 2000);
    } else {
      this.userBehavior.validationAttempts++;
      this.trackBehavior('login_validation_failed', {
        errors: this.errors,
        attempt: this.userBehavior.validationAttempts
      });
    }
  }

  onTogglePassword() {
    this.showPassword = !this.showPassword;
    this.trackBehavior('password_visibility_toggled', { visible: this.showPassword });
  }

  onForgotPassword() {
    this.trackBehavior('forgot_password_clicked');
    this.router.navigate(['/auth/forgot-password']);
  }

  onRegister() {
    this.trackBehavior('navigate_to_register');
    this.router.navigate(['/auth/register']);
  }

  onSocialLogin(provider: string) {
    this.trackBehavior('social_login_attempted', { provider });
    // Handle social login
    console.log('Social login with:', provider);
  }

  // Digital Ethnography: Enhanced form validation with security insights for Nigerian context
  validateForm(): boolean {
    this.errors = {};

    if (!this.loginData.email.trim()) {
      this.errors['email'] = 'Email is required';
    } else if (!this.isValidEmail(this.loginData.email)) {
      this.errors['email'] = 'Please enter a valid email';
    }

    if (!this.loginData.password) {
      this.errors['password'] = 'Password is required';
    }

    // Digital Ethnography: Security validation for Nigerian context
    if (this.securityInsights.failedAttempts >= 3) {
      this.errors['security'] = 'Too many failed attempts. Please try again later or reset your password.';
      this.securityInsights.accountLockout = true;
    }

    return Object.keys(this.errors).length === 0;
  }

  // Email validation
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Digital Ethnography: Load user preferences and insights for Nigerian context
  private loadUserPreferences() {
    // Load remembered email if available
    const rememberedEmail = localStorage.getItem('markt_remembered_email');
    if (rememberedEmail) {
      this.loginData.email = rememberedEmail;
      this.trackBehavior('remembered_email_loaded');
    }

    // Load community insights for returning Nigerian users
    this.loadCommunityInsights();
  }

  private loadCommunityInsights() {
    // TODO: Load real community insights from API for Nigerian campuses
    console.log('Loading community insights for returning Nigerian user');
  }

  // Digital Ethnography: Save user preferences
  private saveUserPreferences() {
    if (this.loginData.rememberMe) {
      localStorage.setItem('markt_remembered_email', this.loginData.email);
      this.trackBehavior('email_remembered');
    } else {
      localStorage.removeItem('markt_remembered_email');
    }
  }

  // Digital Ethnography: Behavior tracking
  private trackBehavior(action: string, data?: any) {
    const behaviorData = {
      action,
      data,
      timestamp: new Date(),
      sessionId: this.generateSessionId(),
      userAgent: navigator.userAgent,
      screenResolution: `${screen.width}x${screen.height}`
    };
    
    this.userBehavior.fieldInteractions.push(action);
    console.log('Login Behavior Tracked:', behaviorData);
    
    // TODO: Send to analytics service
    // this.analyticsService.trackLoginBehavior(behaviorData);
  }

  private generateSessionId(): string {
    return 'login_session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Digital Ethnography: Get security recommendations for Nigerian context
  getSecurityRecommendations(): string[] {
    const recommendations = [];
    
    if (this.securityInsights.failedAttempts > 0) {
      recommendations.push('Consider enabling two-factor authentication for enhanced security');
    }
    
    if (!this.loginData.rememberMe) {
      recommendations.push('Remember this device for faster login on trusted computers');
    }
    
    return recommendations;
  }

  // Digital Ethnography: Get community updates for returning Nigerian users
  getCommunityUpdates(): any[] {
    return [
      {
        type: 'new_member',
        message: 'Chioma from University of Lagos joined your campus community',
        timestamp: new Date(Date.now() - 300000) // 5 minutes ago
      },
      {
        type: 'new_listing',
        message: 'New textbook listings available in your Nigerian campus',
        timestamp: new Date(Date.now() - 600000) // 10 minutes ago
      },
      {
        type: 'community_update',
        message: 'New fashion items trending in your campus marketplace',
        timestamp: new Date(Date.now() - 900000) // 15 minutes ago
      }
    ];
  }
} 