import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="admin-panel-container">
      <h1>Admin Panel</h1>

      <!-- User Management -->
      <div class="admin-section">
        <h2>User Management</h2>
        <div class="users-table">
          <div class="user-row header">
            <span>Name</span>
            <span>Email</span>
            <span>Role</span>
            <span>Status</span>
            <span>Actions</span>
          </div>
          <div 
            class="user-row" 
            *ngFor="let user of users"
          >
            <span>{{ user.name }}</span>
            <span>{{ user.email }}</span>
            <span>{{ user.role }}</span>
            <span>{{ user.status }}</span>
            <div class="actions">
              <button 
                (click)="updateUserStatus(user.id, 'active')"
                [disabled]="user.status === 'active'"
              >
                Activate
              </button>
              <button 
                (click)="updateUserStatus(user.id, 'suspended')"
                [disabled]="user.status === 'suspended'"
              >
                Suspend
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Reports Management -->
      <div class="admin-section">
        <h2>Reports</h2>
        <div class="reports-table">
          <div class="report-row header">
            <span>Type</span>
            <span>Reporter</span>
            <span>Target</span>
            <span>Status</span>
            <span>Actions</span>
          </div>
          <div 
            class="report-row" 
            *ngFor="let report of reports"
          >
            <span>{{ report.type }}</span>
            <span>{{ report.reporter.name }}</span>
            <span>{{ report.target.name }}</span>
            <span>{{ report.status }}</span>
            <div class="actions">
              <button 
                (click)="resolveReport(report.id, 'resolved')"
                [disabled]="report.status === 'resolved'"
              >
                Resolve
              </button>
              <button 
                (click)="resolveReport(report.id, 'dismissed')"
                [disabled]="report.status === 'dismissed'"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Moderation Queue -->
      <div class="admin-section">
        <h2>Moderation Queue</h2>
        <div class="moderation-table">
          <div class="moderation-row header">
            <span>Content Type</span>
            <span>Author</span>
            <span>Reason</span>
            <span>Actions</span>
          </div>
          <div 
            class="moderation-row" 
            *ngFor="let item of moderationQueue"
          >
            <span>{{ item.content_type }}</span>
            <span>{{ item.author.name }}</span>
            <span>{{ item.reason }}</span>
            <div class="actions">
              <button 
                (click)="takeModerationAction(item.id, 'approve')"
              >
                Approve
              </button>
              <button 
                (click)="takeModerationAction(item.id, 'reject')"
              >
                Reject
              </button>
              <button 
                (click)="takeModerationAction(item.id, 'delete')"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Platform Analytics -->
      <div class="admin-section">
        <h2>Platform Analytics</h2>
        <div class="analytics-grid">
          <div class="analytics-card">
            <h3>Total Users</h3>
            <p>{{ platformAnalytics.total_users }}</p>
          </div>
          <div class="analytics-card">
            <h3>Active Users</h3>
            <p>{{ platformAnalytics.active_users }}</p>
          </div>
          <div class="analytics-card">
            <h3>Total Products</h3>
            <p>{{ platformAnalytics.total_products }}</p>
          </div>
          <div class="analytics-card">
            <h3>Total Orders</h3>
            <p>{{ platformAnalytics.total_orders }}</p>
          </div>
        </div>
      </div>

      <!-- Payment Statistics -->
      <div class="admin-section">
        <h2>Payment Statistics</h2>
        <div class="payment-stats">
          <div class="stat-card">
            <h3>Total Revenue</h3>
            <p>₦{{ paymentStats.total_revenue }}</p>
          </div>
          <div class="stat-card">
            <h3>Successful Payments</h3>
            <p>{{ paymentStats.successful_payments }}</p>
          </div>
          <div class="stat-card">
            <h3>Failed Payments</h3>
            <p>{{ paymentStats.failed_payments }}</p>
          </div>
        </div>
      </div>

      <!-- System Health -->
      <div class="admin-section">
        <h2>System Health</h2>
        <div class="health-status">
          <div class="health-card">
            <h3>Overall Status</h3>
            <p [class]="systemHealth.status">{{ systemHealth.status }}</p>
          </div>
          <div class="health-card">
            <h3>Database</h3>
            <p [class]="systemHealth.database">{{ systemHealth.database }}</p>
          </div>
          <div class="health-card">
            <h3>API</h3>
            <p [class]="systemHealth.api">{{ systemHealth.api }}</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-panel-container {
      padding: 20px;
    }
    .admin-section {
      margin-bottom: 40px;
    }
    .users-table, .reports-table, .moderation-table {
      border: 1px solid #ddd;
      border-radius: 8px;
      overflow: hidden;
    }
    .user-row, .report-row, .moderation-row {
      display: grid;
      grid-template-columns: 2fr 2fr 1fr 1fr 2fr;
      padding: 10px;
      border-bottom: 1px solid #eee;
    }
    .user-row.header, .report-row.header, .moderation-row.header {
      background: #f5f5f5;
      font-weight: bold;
    }
    .actions {
      display: flex;
      gap: 5px;
    }
    .actions button {
      padding: 5px 10px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.8em;
    }
    .actions button:first-child {
      background: #28a745;
      color: white;
    }
    .actions button:nth-child(2) {
      background: #ffc107;
      color: black;
    }
    .actions button:last-child {
      background: #dc3545;
      color: white;
    }
    .analytics-grid, .payment-stats, .health-status {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
      margin-top: 15px;
    }
    .analytics-card, .stat-card, .health-card {
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 15px;
      text-align: center;
    }
    .health-card p.healthy {
      color: #28a745;
    }
    .health-card p.warning {
      color: #ffc107;
    }
    .health-card p.error {
      color: #dc3545;
    }
  `]
})
export class AdminPanelComponent implements OnInit {
  private apiService = inject(ApiService);

  // Data properties
  users: any[] = [];
  reports: any[] = [];
  moderationQueue: any[] = [];
  platformAnalytics: any = {};
  paymentStats: any = {};
  systemHealth: any = {};

  // State properties
  loading = false;

  ngOnInit(): void {
    this.loadAdminData();
    this.loadPlatformAnalytics();
    this.loadPaymentStats();
    this.loadSystemHealth();
  }

  private loadAdminData(): void {
    this.loading = true;

    // Load users
    this.apiService.getAdminUsers().subscribe({
      next: (response) => {
        this.users = response.data?.items || [];
      },
      error: (error) => {
        console.error('Error loading admin users:', error);
        this.users = [];
      }
    });

    // Load reports
    this.apiService.getAdminReports().subscribe({
      next: (response) => {
        this.reports = response.data?.items || [];
      },
      error: (error) => {
        console.error('Error loading admin reports:', error);
        this.reports = [];
      }
    });

    // Load moderation queue
    this.apiService.getModerationQueue().subscribe({
      next: (response) => {
        this.moderationQueue = response.data?.items || [];
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading moderation queue:', error);
        this.moderationQueue = [];
        this.loading = false;
      }
    });
  }

  private loadPlatformAnalytics(): void {
    this.apiService.getPlatformAnalytics().subscribe({
      next: (response) => {
        this.platformAnalytics = response.data || {};
      },
      error: (error) => {
        console.error('Error loading platform analytics:', error);
        this.platformAnalytics = {};
      }
    });
  }

  private loadPaymentStats(): void {
    this.apiService.getPaymentStats().subscribe({
      next: (response) => {
        this.paymentStats = response.data || {};
      },
      error: (error) => {
        console.error('Error loading payment stats:', error);
        this.paymentStats = {};
      }
    });
  }

  private loadSystemHealth(): void {
    this.apiService.healthCheck().subscribe({
      next: (response) => {
        this.systemHealth = response.data || {};
      },
      error: (error) => {
        console.error('Error loading system health:', error);
        this.systemHealth = { status: 'error', database: 'error', api: 'error' };
      }
    });
  }

  // User Management
  updateUserStatus(userId: string, status: string): void {
    const statusData = { status };
    
    this.apiService.updateUserStatus(userId, statusData).subscribe({
      next: () => {
        // Reload users
        this.apiService.getAdminUsers().subscribe({
          next: (response) => {
            this.users = response.data?.items || [];
          },
          error: (error) => {
            console.error('Error reloading users:', error);
          }
        });
      },
      error: (error) => {
        console.error('Error updating user status:', error);
      }
    });
  }

  // Reports Management
  resolveReport(reportId: string, resolution: string): void {
    const resolutionData = { resolution };
    
    this.apiService.resolveReport(reportId, resolutionData).subscribe({
      next: () => {
        // Reload reports
        this.apiService.getAdminReports().subscribe({
          next: (response) => {
            this.reports = response.data?.items || [];
          },
          error: (error) => {
            console.error('Error reloading reports:', error);
          }
        });
      },
      error: (error) => {
        console.error('Error resolving report:', error);
      }
    });
  }

  // Moderation Actions
    takeModerationAction(itemId: string, action: string): void {
    const actionData = {
      item_id: itemId,
      action: action as 'warn' | 'suspend' | 'ban' | 'delete',
      reason: 'Admin action'
    };
    
    this.apiService.takeModerationAction(actionData).subscribe({
      next: () => {
        // Reload moderation queue
        this.apiService.getModerationQueue().subscribe({
          next: (response) => {
            this.moderationQueue = response.data?.items || [];
          },
          error: (error) => {
            console.error('Error reloading moderation queue:', error);
          }
        });
      },
      error: (error) => {
        console.error('Error taking moderation action:', error);
      }
    });
  }

  // Additional admin endpoint integrations
  getPaymentStats(): void {
    this.apiService.getPaymentStats().subscribe({
      next: (response) => {
        console.log('Payment stats loaded:', response.data);
      },
      error: (error) => {
        console.error('Error loading payment stats:', error);
      }
    });
  }

  healthCheck(): void {
    this.apiService.healthCheck().subscribe({
      next: (response) => {
        console.log('Health check result:', response.data);
      },
      error: (error) => {
        console.error('Health check failed:', error);
      }
    });
  }

  // Additional health and shop endpoint integrations
  detailedHealthCheck(): void {
    this.apiService.detailedHealthCheck().subscribe({
      next: (response) => {
        console.log('Detailed health check result:', response.data);
      },
      error: (error) => {
        console.error('Detailed health check failed:', error);
      }
    });
  }

  getMetrics(): void {
    this.apiService.getMetrics().subscribe({
      next: (response) => {
        console.log('Metrics loaded:', response.data);
      },
      error: (error) => {
        console.error('Error loading metrics:', error);
      }
    });
  }

  getStatus(): void {
    this.apiService.getStatus().subscribe({
      next: (response) => {
        console.log('Status loaded:', response.data);
      },
      error: (error) => {
        console.error('Error loading status:', error);
      }
    });
  }

  livenessCheck(): void {
    this.apiService.livenessCheck().subscribe({
      next: (response) => {
        console.log('Liveness check result:', response.data);
      },
      error: (error) => {
        console.error('Liveness check failed:', error);
      }
    });
  }

  readinessCheck(): void {
    this.apiService.readinessCheck().subscribe({
      next: (response) => {
        console.log('Readiness check result:', response.data);
      },
      error: (error) => {
        console.error('Readiness check failed:', error);
      }
    });
  }

  getShopDetails(shopId: number): void {
    this.apiService.getShopDetails(shopId).subscribe({
      next: (response) => {
        console.log('Shop details loaded:', response.data);
      },
      error: (error) => {
        console.error('Error loading shop details:', error);
      }
    });
  }
} 