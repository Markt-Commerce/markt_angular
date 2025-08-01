import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './onboarding.component.html',
  styleUrl: './onboarding.component.css'
})
export class OnboardingComponent {
  currentStep = 1;
  totalSteps = 4;
  selectedRole = '';
  
  // Digital Ethnography: Role selection with behavioral insights for Nigerian students
  roles = [
    { 
      value: 'buyer', 
      label: 'I want to buy', 
      description: 'Browse and purchase items from campus sellers',
      behavioralInsight: '90% of Nigerian students start as buyers before becoming sellers',
      communityBenefit: 'Join 1,100+ active buyers in your Nigerian campus community'
    },
    { 
      value: 'seller', 
      label: 'I want to sell', 
      description: 'List items and manage your campus business',
      behavioralInsight: 'Nigerian student sellers earn an average of ₦25,000/month',
      communityBenefit: 'Connect with 800+ verified buyers on your campus'
    },
    { 
      value: 'both', 
      label: 'I want to do both', 
      description: 'Buy and sell within your campus community',
      behavioralInsight: 'Most active Nigerian users engage in both buying and selling',
      communityBenefit: 'Full access to Nigerian campus marketplace ecosystem'
    }
  ];

  // Digital Ethnography: Campus verification with trust building for Nigerian universities
  campusData = {
    campus: '',
    studentId: '',
    graduationYear: '',
    verificationStatus: 'pending' as 'pending' | 'verified' | 'failed'
  };

  // Digital Ethnography: Profile setup with social context for Nigerian students
  profileData = {
    displayName: '',
    bio: '',
    profilePicture: null as File | null,
    socialPreferences: {
      showEmail: false,
      showPhone: false,
      allowDirectMessages: true,
      shareLocation: false
    }
  };

  isCompleted = false;

  // Digital Ethnography: Community insights for trust building in Nigerian campuses
  communityInsights = {
    totalMembers: '1,247',
    activeToday: '89',
    avgResponseTime: '1.8 minutes',
    trustScore: '96%'
  };

  // Digital Ethnography: Behavioral tracking
  userBehavior = {
    timeSpentOnStep: {} as { [key: number]: number },
    interactions: [] as string[],
    preferences: {} as { [key: string]: any }
  };

  constructor(private router: Router) {
    this.startStepTimer();
  }

  onRoleSelect(role: string) {
    this.selectedRole = role;
    this.trackBehavior('role_selected', { role, step: this.currentStep });
    
    // Digital Ethnography: Show role-specific insights for Nigerian context
    const selectedRoleData = this.roles.find(r => r.value === role);
    if (selectedRoleData) {
      console.log('Role Insight:', selectedRoleData.behavioralInsight);
      console.log('Community Benefit:', selectedRoleData.communityBenefit);
    }
  }

  onCampusChange() {
    this.trackBehavior('campus_selected', { 
      campus: this.campusData.campus, 
      step: this.currentStep 
    });
    
    // Digital Ethnography: Show campus-specific insights for Nigerian context
    const campusInsights = this.getCampusInsights();
    if (campusInsights) {
      console.log('Campus Insight:', campusInsights);
    }
  }

  onNext() {
    if (this.canProceed()) {
      this.trackBehavior('step_completed', { 
        step: this.currentStep, 
        timeSpent: this.userBehavior.timeSpentOnStep[this.currentStep] 
      });
      
      if (this.currentStep < this.totalSteps) {
        this.currentStep++;
        this.startStepTimer();
      } else {
        this.completeOnboarding();
      }
    }
  }

  onBack() {
    if (this.currentStep > 1) {
      this.trackBehavior('step_back', { step: this.currentStep });
      this.currentStep--;
      this.startStepTimer();
    }
  }

  onSkip() {
    this.trackBehavior('onboarding_skipped', { 
      completedSteps: this.currentStep - 1,
      timeSpent: Object.values(this.userBehavior.timeSpentOnStep).reduce((a, b) => a + b, 0)
    });
    this.completeOnboarding();
  }

  completeOnboarding() {
    this.isCompleted = true;
    
    // Digital Ethnography: Final behavior tracking
    this.trackBehavior('onboarding_completed', {
      totalTime: Object.values(this.userBehavior.timeSpentOnStep).reduce((a, b) => a + b, 0),
      role: this.selectedRole,
      campus: this.campusData.campus,
      hasProfilePicture: !!this.profileData.profilePicture
    });

    // Navigate to main app after onboarding completion
    setTimeout(() => {
      this.router.navigate(['/app/feed']);
    }, 2000);
  }

  getProgressPercentage(): number {
    return (this.currentStep / this.totalSteps) * 100;
  }

  canProceed(): boolean {
    switch (this.currentStep) {
      case 1:
        return this.selectedRole !== '';
      case 2:
        return this.campusData.campus !== '' && this.campusData.studentId !== '';
      case 3:
        return this.profileData.displayName !== '';
      default:
        return true;
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.profileData.profilePicture = file;
      this.trackBehavior('profile_picture_uploaded', { 
        fileSize: file.size, 
        fileType: file.type 
      });
    }
  }

  // Digital Ethnography: Behavior tracking methods
  private startStepTimer() {
    const startTime = Date.now();
    this.userBehavior.timeSpentOnStep[this.currentStep] = 0;
    
    // Update timer every second
    const timer = setInterval(() => {
      this.userBehavior.timeSpentOnStep[this.currentStep] = 
        (Date.now() - startTime) / 1000;
    }, 1000);

    // Store timer reference for cleanup
    (this as any).currentTimer = timer;
  }

  private trackBehavior(action: string, data?: any) {
    const behaviorData = {
      action,
      data,
      timestamp: new Date(),
      step: this.currentStep,
      sessionId: this.generateSessionId()
    };
    
    this.userBehavior.interactions.push(action);
    console.log('User Behavior Tracked:', behaviorData);
    
    // TODO: Send to analytics service
    // this.analyticsService.trackBehavior(behaviorData);
  }

  private generateSessionId(): string {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Digital Ethnography: Get community insights for current Nigerian campus
  getCampusInsights(): any {
    if (!this.campusData.campus) return null;
    
    // Nigerian campus-specific insights
    const campusInsights = {
      'University of Lagos': { activeMembers: '247', popularCategories: ['Textbooks', 'Electronics', 'Fashion'] },
      'University of Nigeria, Nsukka': { activeMembers: '183', popularCategories: ['Books', 'Tech Gadgets', 'Sports'] },
      'Ahmadu Bello University': { activeMembers: '156', popularCategories: ['Textbooks', 'Electronics', 'Traditional Items'] },
      'Obafemi Awolowo University': { activeMembers: '134', popularCategories: ['Books', 'Electronics', 'Fashion'] },
      'University of Ibadan': { activeMembers: '198', popularCategories: ['Textbooks', 'Electronics', 'Food Items'] },
      'University of Benin': { activeMembers: '145', popularCategories: ['Books', 'Electronics', 'Fashion'] },
      'Federal University of Technology, Akure': { activeMembers: '112', popularCategories: ['Tech Gadgets', 'Books', 'Electronics'] },
      'Covenant University': { activeMembers: '167', popularCategories: ['Textbooks', 'Electronics', 'Fashion'] },
      'Babcock University': { activeMembers: '98', popularCategories: ['Books', 'Electronics', 'Fashion'] },
      'Lagos State University': { activeMembers: '178', popularCategories: ['Textbooks', 'Electronics', 'Fashion'] }
    };
    
    return campusInsights[this.campusData.campus as keyof typeof campusInsights] || null;
  }
} 