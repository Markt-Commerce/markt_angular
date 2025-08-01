import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  // Form data
  registerData = {
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    campus: '',
    agreeToTerms: false
  };

  // UI state
  isLoading = false;
  showPassword = false;
  showConfirmPassword = false;

  // Form validation
  errors: { [key: string]: string } = {};
  passwordStrength = 0;

  // Digital Ethnography: Nigerian campus options with behavioral insights
  campuses = [
    { value: '', label: 'Select your campus' },
    { 
      value: 'university-of-lagos', 
      label: 'University of Lagos',
      activeMembers: '247',
      avgTrustScore: '4.8/5',
      popularCategories: ['Textbooks', 'Electronics', 'Fashion Items']
    },
    { 
      value: 'university-of-nigeria-nsukka', 
      label: 'University of Nigeria, Nsukka',
      activeMembers: '183',
      avgTrustScore: '4.9/5',
      popularCategories: ['Books', 'Tech Gadgets', 'Sports Equipment']
    },
    { 
      value: 'ahmadu-bello-university', 
      label: 'Ahmadu Bello University',
      activeMembers: '156',
      avgTrustScore: '4.7/5',
      popularCategories: ['Textbooks', 'Electronics', 'Traditional Items']
    },
    { 
      value: 'obafemi-awolowo-university', 
      label: 'Obafemi Awolowo University',
      activeMembers: '134',
      avgTrustScore: '4.8/5',
      popularCategories: ['Books', 'Electronics', 'Fashion']
    },
    { 
      value: 'university-of-ibadan', 
      label: 'University of Ibadan',
      activeMembers: '198',
      avgTrustScore: '4.9/5',
      popularCategories: ['Textbooks', 'Electronics', 'Food Items']
    },
    { 
      value: 'university-of-benin', 
      label: 'University of Benin',
      activeMembers: '145',
      avgTrustScore: '4.7/5',
      popularCategories: ['Books', 'Electronics', 'Fashion']
    },
    { 
      value: 'federal-university-of-technology-akure', 
      label: 'Federal University of Technology, Akure',
      activeMembers: '112',
      avgTrustScore: '4.8/5',
      popularCategories: ['Tech Gadgets', 'Books', 'Electronics']
    },
    { 
      value: 'covenant-university', 
      label: 'Covenant University',
      activeMembers: '167',
      avgTrustScore: '4.9/5',
      popularCategories: ['Textbooks', 'Electronics', 'Fashion']
    },
    { 
      value: 'babcock-university', 
      label: 'Babcock University',
      activeMembers: '98',
      avgTrustScore: '4.7/5',
      popularCategories: ['Books', 'Electronics', 'Fashion']
    },
    { 
      value: 'lagos-state-university', 
      label: 'Lagos State University',
      activeMembers: '178',
      avgTrustScore: '4.8/5',
      popularCategories: ['Textbooks', 'Electronics', 'Fashion']
    },
    { value: 'other', label: 'Other Nigerian University' }
  ];

  // Digital Ethnography: Trust indicators and social proof for Nigerian context
  trustIndicators = {
    totalUsers: '1,247',
    verifiedCampuses: '23',
    avgResponseTime: '1.8 minutes',
    trustScore: '96%'
  };

  // Digital Ethnography: Behavioral tracking
  userBehavior = {
    formStartTime: Date.now(),
    fieldInteractions: [] as string[],
    validationAttempts: 0,
    campusSelection: null as string | null
  };

  constructor(private router: Router) {
    this.trackBehavior('registration_started');
  }

  // Navigation
  onRegister() {
    if (this.validateForm()) {
      this.isLoading = true;
      this.trackBehavior('registration_submitted', {
        campus: this.registerData.campus,
        hasProfilePicture: false,
        timeSpent: (Date.now() - this.userBehavior.formStartTime) / 1000
      });
      
      // TODO: Implement registration logic
      console.log('Registration attempt:', this.registerData);
      setTimeout(() => {
        this.isLoading = false;
        this.trackBehavior('registration_successful');
        // Navigate to onboarding after successful registration
        this.router.navigate(['/onboarding']);
      }, 2000);
    } else {
      this.userBehavior.validationAttempts++;
      this.trackBehavior('validation_failed', {
        errors: this.errors,
        attempt: this.userBehavior.validationAttempts
      });
    }
  }

  onLogin() {
    this.trackBehavior('navigate_to_login');
    this.router.navigate(['/auth/login']);
  }

  onTogglePassword() {
    this.showPassword = !this.showPassword;
    this.trackBehavior('password_visibility_toggled', { visible: this.showPassword });
  }

  onToggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
    this.trackBehavior('confirm_password_visibility_toggled', { visible: this.showConfirmPassword });
  }

  onSocialLogin(provider: string) {
    this.trackBehavior('social_login_attempted', { provider });
    // Handle social login
    console.log('Social login with:', provider);
  }

  // Digital Ethnography: Enhanced form validation with behavioral insights for Nigerian context
  validateForm(): boolean {
    this.errors = {};

    if (!this.registerData.fullName.trim()) {
      this.errors['fullName'] = 'Full name is required';
    } else if (this.registerData.fullName.trim().length < 2) {
      this.errors['fullName'] = 'Full name must be at least 2 characters';
    }

    if (!this.registerData.email.trim()) {
      this.errors['email'] = 'Email is required';
    } else if (!this.isValidEmail(this.registerData.email)) {
      this.errors['email'] = 'Please enter a valid email';
    } else if (!this.isNigerianCampusEmail(this.registerData.email)) {
      this.errors['email'] = 'Please use your Nigerian university email address for verification';
    }

    if (!this.registerData.password) {
      this.errors['password'] = 'Password is required';
    } else if (this.registerData.password.length < 8) {
      this.errors['password'] = 'Password must be at least 8 characters';
    } else if (this.passwordStrength < 50) {
      this.errors['password'] = 'Please choose a stronger password';
    }

    if (this.registerData.password !== this.registerData.confirmPassword) {
      this.errors['confirmPassword'] = 'Passwords do not match';
    }

    if (!this.registerData.campus) {
      this.errors['campus'] = 'Please select your Nigerian campus';
    }

    if (!this.registerData.agreeToTerms) {
      this.errors['terms'] = 'You must agree to the terms and conditions';
    }

    return Object.keys(this.errors).length === 0;
  }

  // Email validation
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Digital Ethnography: Nigerian campus email validation for trust building
  isNigerianCampusEmail(email: string): boolean {
    const nigerianCampusDomains = [
      'unilag.edu.ng', 'unn.edu.ng', 'abu.edu.ng', 'oauife.edu.ng',
      'ui.edu.ng', 'uniben.edu.ng', 'futa.edu.ng', 'covenantuniversity.edu.ng',
      'babcock.edu.ng', 'lasu.edu.ng', 'futa.edu.ng', 'uniport.edu.ng',
      'unimaid.edu.ng', 'usmanu.edu.ng', 'fudma.edu.ng', 'fud.edu.ng'
    ];
    const domain = email.split('@')[1];
    return nigerianCampusDomains.includes(domain);
  }

  // Password strength calculation
  calculatePasswordStrength(password: string): number {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    return strength;
  }

  onPasswordChange() {
    this.passwordStrength = this.calculatePasswordStrength(this.registerData.password);
    this.trackBehavior('password_strength_updated', { strength: this.passwordStrength });
  }

  onCampusChange() {
    this.userBehavior.campusSelection = this.registerData.campus;
    this.trackBehavior('campus_selected', { 
      campus: this.registerData.campus,
      campusData: this.campuses.find(c => c.value === this.registerData.campus)
    });
  }

  // Digital Ethnography: Behavior tracking
  private trackBehavior(action: string, data?: any) {
    const behaviorData = {
      action,
      data,
      timestamp: new Date(),
      sessionId: this.generateSessionId()
    };
    
    this.userBehavior.fieldInteractions.push(action);
    console.log('Registration Behavior Tracked:', behaviorData);
    
    // TODO: Send to analytics service
    // this.analyticsService.trackRegistrationBehavior(behaviorData);
  }

  private generateSessionId(): string {
    return 'reg_session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Digital Ethnography: Get campus insights for selected Nigerian campus
  getCampusInsights(): any {
    if (!this.registerData.campus) return null;
    return this.campuses.find(c => c.value === this.registerData.campus);
  }
} 