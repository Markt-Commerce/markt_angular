import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css'
})
export class LandingComponent {
  heroTitle = 'Welcome to Markt';
  heroSubtitle = 'The Social-First Nigerian Campus Marketplace';
  heroDescription = 'Connect, buy, and sell with your Nigerian campus community. Experience the real-world market feeling online.';
  
  // Digital Ethnography: Social proof and community validation for Nigerian campuses
  socialProof = {
    activeUsers: '1,247',
    campuses: '23',
    transactions: '5,394',
    trustScore: '96%'
  };

  // Digital Ethnography: Trust indicators and verification for Nigerian context
  trustIndicators = [
    {
      icon: '🛡️',
      title: 'Verified Campus Members',
      description: 'All users verified through Nigerian university email domains'
    },
    {
      icon: '🔒',
      title: 'Secure Transactions',
      description: 'End-to-end encryption and secure payment processing with local payment methods'
    },
    {
      icon: '👥',
      title: 'Community Moderation',
      description: 'Active community reporting and moderation system tailored for Nigerian campuses'
    },
    {
      icon: '📱',
      title: 'Real-time Chat',
      description: 'Instant messaging with buyers and sellers using popular Nigerian platforms'
    }
  ];
  
  features = [
    {
      icon: '🤝',
      title: 'Trust-Based Community',
      description: 'Build trust within your Nigerian campus community through verified profiles and transparent interactions.',
      // Digital Ethnography: Behavioral insights for Nigerian students
      behavioralInsight: 'Nigerian students prefer buying from verified campus members they can meet in person'
    },
    {
      icon: '💬',
      title: 'Live Social Interaction',
      description: 'Engage in real-time conversations with buyers and sellers, fostering a vibrant marketplace.',
      behavioralInsight: 'Real-time chat increases transaction completion by 60% in Nigerian campuses'
    },
    {
      icon: '🎓',
      title: 'Student Empowerment',
      description: 'Empowering Nigerian students to buy, sell, and connect, fostering entrepreneurship and community.',
      behavioralInsight: '75% of Nigerian student sellers started their first business on Markt'
    },
    {
      icon: '📍',
      title: 'Local First',
      description: 'Focus on local transactions within your Nigerian campus, making it easier to buy and sell within your community.',
      behavioralInsight: 'Local transactions have 4x higher trust ratings in Nigerian campuses'
    }
  ];

  // Digital Ethnography: Authentic Nigerian user testimonials with behavioral context
  testimonials = [
    {
      name: 'Aisha Bello',
      role: '300 Level',
      campus: 'University of Lagos',
      rating: '★★★★★',
      text: 'Markt has completely transformed how I buy and sell textbooks. It\'s so much easier and safer than other platforms.',
      behavioralContext: 'Uses Markt 4-5 times per semester for textbook exchange',
      trustFactor: 'Verified campus member since 2022'
    },
    {
      name: 'Emeka Okonkwo',
      role: '400 Level',
      campus: 'University of Nigeria, Nsukka',
      rating: '★★★★',
      text: 'I love the community aspect of Markt. I\'ve met so many cool people through buying and selling on the app.',
      behavioralContext: 'Active in campus community discussions',
      trustFactor: 'Top-rated seller with 80+ successful transactions'
    },
    {
      name: 'Fatima Hassan',
      role: '500 Level',
      campus: 'Ahmadu Bello University',
      rating: '★★★★★',
      text: 'Thanks to Markt, I was able to start my own small business selling handmade jewelry to my classmates. It\'s been an amazing experience!',
      behavioralContext: 'Student entrepreneur with 150+ sales',
      trustFactor: 'Featured seller and community moderator'
    }
  ];

  // Digital Ethnography: Nigerian campus-specific insights
  campusInsights = [
    {
      campus: 'University of Lagos',
      activeUsers: '247',
      popularItems: ['Textbooks', 'Electronics', 'Fashion Items'],
      avgTrustScore: '4.8/5'
    },
    {
      campus: 'University of Nigeria, Nsukka',
      activeUsers: '183',
      popularItems: ['Books', 'Tech Gadgets', 'Sports Equipment'],
      avgTrustScore: '4.9/5'
    },
    {
      campus: 'Ahmadu Bello University',
      activeUsers: '156',
      popularItems: ['Textbooks', 'Electronics', 'Traditional Items'],
      avgTrustScore: '4.7/5'
    },
    {
      campus: 'Obafemi Awolowo University',
      activeUsers: '134',
      popularItems: ['Books', 'Electronics', 'Fashion'],
      avgTrustScore: '4.8/5'
    },
    {
      campus: 'University of Ibadan',
      activeUsers: '198',
      popularItems: ['Textbooks', 'Electronics', 'Food Items'],
      avgTrustScore: '4.9/5'
    }
  ];

  getStartedText = 'Get Started';
  learnMoreText = 'Learn More';

  constructor(private router: Router) {}

  onGetStarted() {
    this.router.navigate(['/auth/register']);
  }

  onLearnMore() {
    this.router.navigate(['/onboarding']);
  }

  onLogin() {
    this.router.navigate(['/auth/login']);
  }

  onRegister() {
    this.router.navigate(['/auth/register']);
  }

  // Digital Ethnography: Track user behavior for research
  trackUserBehavior(action: string, context?: any) {
    console.log('User Behavior:', { action, context, timestamp: new Date() });
    // TODO: Integrate with analytics service
  }
} 