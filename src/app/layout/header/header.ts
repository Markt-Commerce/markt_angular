import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ThemeToggleComponent } from '../../shared/theme-toggle/theme-toggle';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, ThemeToggleComponent],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class HeaderComponent {
  // Navigation items based on the design analysis
  navItems = [
    { label: 'Marketplace', route: '/marketplace', icon: '🛍️' },
    { label: 'Community', route: '/community', icon: '👥' },
    { label: 'Chat', route: '/chat', icon: '💬' },
    { label: 'Profile', route: '/profile', icon: '👤' }
  ];
}
