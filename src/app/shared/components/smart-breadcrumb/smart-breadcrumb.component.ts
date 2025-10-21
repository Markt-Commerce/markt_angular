import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { 
  faHome, 
  faChevronRight, 
  faStore, 
  faComments, 
  faUser, 
  faShoppingCart,
  faClipboard,
  faTag,
  faReceipt,
  faCog,
  faSearch,
  faList,
  faBell,
  faPlus,
  faEdit,
  faEye,
  faShare,
  faBookmark,
  faCheckCircle,
  faTimesCircle,
  faSpinner,
  faDownload,
  faUpload,
  faSync,
  faRefresh,
  faSave,
  faPrint,
  faCopy,
  faImage,
  faVideo,
  faFile,
  faFolder,
  faBox,
  faUsers,
  faStream,
  faFileText,
  faHistory,
  faTruck,
  faHandshake,
  faCreditCard,
  faUserCog,
  faShield,
  faSliders,
  faChartLine,
  faCamera
} from '@fortawesome/free-solid-svg-icons';

import { BreadcrumbService, BreadcrumbItem } from '../../../core/services/breadcrumb.service';

@Component({
  selector: 'app-smart-breadcrumb',
  standalone: true,
  imports: [CommonModule, RouterLink, FontAwesomeModule],
  template: `
    <div class="smart-breadcrumb-container">
      <!-- Main Breadcrumb -->
      <nav 
        *ngIf="breadcrumbs.length > 0" 
        class="breadcrumb-main"
        aria-label="Breadcrumb navigation"
        role="navigation"
      >
        <ol class="breadcrumb-list" role="list">
          <li 
            *ngFor="let breadcrumb of breadcrumbs; let last = last; let i = index; trackBy: trackByBreadcrumb" 
            class="breadcrumb-item"
            [class.breadcrumb-item--current]="last"
            [class.breadcrumb-item--clickable]="breadcrumb.isClickable && !last"
            role="listitem"
          >
            <!-- Icon -->
            <fa-icon 
              *ngIf="breadcrumb.icon" 
              [icon]="getIcon(breadcrumb.icon)" 
              class="breadcrumb-icon"
              [class.breadcrumb-icon--current]="last"
              [attr.aria-hidden]="true"
            ></fa-icon>
            
            <!-- Link or Text -->
            <a 
              *ngIf="breadcrumb.isClickable && !last"
              [routerLink]="breadcrumb.url"
              class="breadcrumb-link"
              [attr.aria-current]="last ? 'page' : null"
              [attr.aria-label]="'Navigate to ' + breadcrumb.label"
              (click)="onBreadcrumbClick(breadcrumb)"
            >
              {{ breadcrumb.label }}
            </a>
            
            <span 
              *ngIf="!breadcrumb.isClickable || last"
              class="breadcrumb-text"
              [class.breadcrumb-text--current]="last"
              [attr.aria-current]="last ? 'page' : null"
              [attr.aria-label]="last ? 'Current page: ' + breadcrumb.label : breadcrumb.label"
            >
              {{ breadcrumb.label }}
            </span>
            
            <!-- Role Badge for Seller Routes -->
            <span 
              *ngIf="breadcrumb.metadata?.role === 'seller' && !last"
              class="breadcrumb-badge breadcrumb-badge--seller"
              title="Seller Tools"
              aria-label="Seller section"
            >
              Seller
            </span>
            
            <!-- Role Badge for Buyer Routes -->
            <span 
              *ngIf="breadcrumb.metadata?.role === 'buyer' && !last"
              class="breadcrumb-badge breadcrumb-badge--buyer"
              title="Buyer Tools"
              aria-label="Buyer section"
            >
              Buyer
            </span>
            
            <!-- Separator -->
            <fa-icon 
              *ngIf="!last"
              [icon]="faChevronRight" 
              class="breadcrumb-separator"
              aria-hidden="true"
            ></fa-icon>
          </li>
        </ol>
      </nav>
    </div>
  `,
  styles: [`
    .smart-breadcrumb-container {
      background: white;
      border-bottom: 1px solid #e2e8f0;
      position: sticky;
      top: 0; /* Stick to top of main content area */
      z-index: 30; /* Above content, below header */
    }

    .breadcrumb-main {
      padding: 0.5rem 1.5rem;
    }

    .breadcrumb-list {
      display: flex;
      align-items: center;
      flex-wrap: nowrap; /* Prevent wrapping to keep on single line */
      gap: 0.375rem;
      list-style: none;
      margin: 0;
      padding: 0;
      font-size: 0.8125rem;
      line-height: 1.2;
      overflow-x: auto; /* Allow horizontal scrolling if needed */
      -webkit-overflow-scrolling: touch;
    }

    .breadcrumb-item {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      flex-shrink: 0; /* Prevent items from shrinking */
    }

    .breadcrumb-item--current {
      font-weight: 600;
    }

    .breadcrumb-item--clickable:hover {
      transform: translateY(-1px);
    }

    .breadcrumb-icon {
      width: 0.875rem;
      height: 0.875rem;
      color: #6b7280;
      flex-shrink: 0;
    }

    .breadcrumb-icon--current {
      color: #e94c2a;
    }

    .breadcrumb-link {
      color: #4b5563;
      text-decoration: none;
      transition: color 0.2s ease;
    }

    .breadcrumb-link:hover {
      color: #e94c2a;
    }

    .breadcrumb-text {
      color: #6b7280;
    }

    .breadcrumb-text--current {
      color: #1f2937;
      font-weight: 600;
    }

    .breadcrumb-separator {
      width: 0.625rem;
      height: 0.625rem;
      color: #9ca3af;
      margin: 0 0.125rem;
      flex-shrink: 0;
    }

    .breadcrumb-badge {
      font-size: 0.625rem;
      font-weight: 600;
      padding: 0.125rem 0.375rem;
      border-radius: 0.25rem;
      text-transform: uppercase;
      letter-spacing: 0.025em;
      margin-left: 0.25rem;
    }

    .breadcrumb-badge--seller {
      background-color: #fef3c7;
      color: #92400e;
    }

    .breadcrumb-badge--buyer {
      background-color: #dbeafe;
      color: #1e40af;
    }

    /* Mobile optimizations */
    @media (max-width: 768px) {
      .smart-breadcrumb-container {
        top: 56px; /* Adjust for mobile header */
      }

      .breadcrumb-main {
        padding: 0.375rem 1rem;
      }

      .breadcrumb-list {
        font-size: 0.75rem;
        gap: 0.25rem;
      }

      .breadcrumb-badge {
        display: none; /* Hide badges on mobile to save space */
      }

      .breadcrumb-icon {
        width: 0.75rem;
        height: 0.75rem;
      }

      .breadcrumb-separator {
        width: 0.5rem;
        height: 0.5rem;
        margin: 0 0.125rem;
      }
    }

    /* Accessibility improvements */
    .breadcrumb-link:focus {
      outline: 2px solid #e94c2a;
      outline-offset: 2px;
      border-radius: 0.25rem;
    }

    /* Animation for breadcrumb changes */
    .breadcrumb-item {
      animation: fadeInUp 0.3s ease-out;
    }

    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(4px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `]
})
export class SmartBreadcrumbComponent implements OnInit, OnDestroy {
  private breadcrumbService = inject(BreadcrumbService);
  private subscription = new Subscription();

  // FontAwesome icons - only the ones actually used
  readonly faChevronRight = faChevronRight;
  readonly faHome = faHome;
  readonly faStore = faStore;
  readonly faComments = faComments;
  readonly faUser = faUser;
  readonly faShoppingCart = faShoppingCart;
  readonly faClipboard = faClipboard;
  readonly faTag = faTag;
  readonly faReceipt = faReceipt;
  readonly faCog = faCog;
  readonly faSearch = faSearch;
  readonly faList = faList;
  readonly faBell = faBell;
  readonly faPlus = faPlus;
  readonly faEdit = faEdit;
  readonly faEye = faEye;
  readonly faShare = faShare;
  readonly faBookmark = faBookmark;
  readonly faCheckCircle = faCheckCircle;
  readonly faTimesCircle = faTimesCircle;
  readonly faSpinner = faSpinner;
  readonly faDownload = faDownload;
  readonly faUpload = faUpload;
  readonly faSync = faSync;
  readonly faRefresh = faRefresh;
  readonly faSave = faSave;
  readonly faPrint = faPrint;
  readonly faCopy = faCopy;
  readonly faImage = faImage;
  readonly faVideo = faVideo;
  readonly faFile = faFile;
  readonly faFolder = faFolder;
  readonly faBox = faBox;
  readonly faUsers = faUsers;
  readonly faStream = faStream;
  readonly faFileText = faFileText;
  readonly faHistory = faHistory;
  readonly faTruck = faTruck;
  readonly faHandshake = faHandshake;
  readonly faCreditCard = faCreditCard;
  readonly faUserCog = faUserCog;
  readonly faShield = faShield;
  readonly faSliders = faSliders;
  readonly faChartLine = faChartLine;
  readonly faCamera = faCamera;

  breadcrumbs: BreadcrumbItem[] = [];

  ngOnInit(): void {
    this.initializeBreadcrumbs();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private initializeBreadcrumbs(): void {
    this.subscription.add(
      this.breadcrumbService.breadcrumbs$.subscribe(breadcrumbs => {
        this.breadcrumbs = breadcrumbs;
      })
    );
  }

  /**
   * Track by function for ngFor optimization
   * @param index - The index of the item
   * @param breadcrumb - The breadcrumb item
   * @returns A unique identifier for the breadcrumb
   */
  trackByBreadcrumb(index: number, breadcrumb: BreadcrumbItem): string {
    return `${breadcrumb.url}-${breadcrumb.label}-${index}`;
  }

  /**
   * Handle breadcrumb click for analytics tracking
   * @param breadcrumb - The clicked breadcrumb item
   */
  onBreadcrumbClick(breadcrumb: BreadcrumbItem): void {
    // This could be used for analytics tracking
  }

  /**
   * Get FontAwesome icon by name with fallback to home icon
   * @param iconName - The name of the icon to retrieve
   * @returns FontAwesome icon or home icon as fallback
   */
  getIcon(iconName: string): any {
    if (!iconName) {
      return this.faHome;
    }

    // Optimized icon mapping - only includes icons that are actually used
    const iconMap: { [key: string]: any } = {
      'home': this.faHome,
      'store': this.faStore,
      'comments': this.faComments,
      'user': this.faUser,
      'shopping-cart': this.faShoppingCart,
      'clipboard': this.faClipboard,
      'tag': this.faTag,
      'receipt': this.faReceipt,
      'cog': this.faCog,
      'search': this.faSearch,
      'list': this.faList,
      'bell': this.faBell,
      'plus': this.faPlus,
      'edit': this.faEdit,
      'eye': this.faEye,
      'share': this.faShare,
      'bookmark': this.faBookmark,
      'check-circle': this.faCheckCircle,
      'times-circle': this.faTimesCircle,
      'spinner': this.faSpinner,
      'download': this.faDownload,
      'upload': this.faUpload,
      'sync': this.faSync,
      'refresh': this.faRefresh,
      'save': this.faSave,
      'print': this.faPrint,
      'copy': this.faCopy,
      'image': this.faImage,
      'video': this.faVideo,
      'file': this.faFile,
      'folder': this.faFolder,
      'box': this.faBox,
      'users': this.faUsers,
      'stream': this.faStream,
      'file-text': this.faFileText,
      'history': this.faHistory,
      'truck': this.faTruck,
      'handshake': this.faHandshake,
      'credit-card': this.faCreditCard,
      'user-cog': this.faUserCog,
      'shield': this.faShield,
      'sliders': this.faSliders,
      'chart-line': this.faChartLine,
      'camera': this.faCamera
    };

    return iconMap[iconName] || this.faHome; // Always fallback to home icon
  }
}