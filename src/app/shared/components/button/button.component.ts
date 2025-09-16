import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ButtonVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'ghost' | 'link';
export type ButtonSize = 'sm' | 'md' | 'lg';
export type ButtonType = 'button' | 'submit' | 'reset';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      [type]="type"
      [disabled]="disabled || loading"
      [class]="buttonClasses"
      (click)="onClick($event)"
      [attr.aria-label]="ariaLabel"
      [attr.aria-describedby]="ariaDescribedby"
      [attr.aria-busy]="loading"
    >
      @if (loading) {
        <span class="loading-spinner"></span>
      }
      <ng-content></ng-content>
    </button>
  `,
  styles: [`
    button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      border: none;
      border-radius: var(--radius-md);
      font-weight: var(--font-weight-medium);
      text-decoration: none;
      transition: all var(--transition-normal);
      cursor: pointer;
      font-size: var(--font-size-base);
      line-height: 1;
      position: relative;
      overflow: hidden;
    }

    button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none !important;
    }

    button:not(:disabled):hover {
      transform: translateY(-1px);
      box-shadow: var(--shadow-md);
    }

    button:not(:disabled):active {
      transform: translateY(0);
    }

    /* Size variants */
    .btn-sm {
      padding: var(--spacing-xs) var(--spacing-sm);
      font-size: var(--font-size-sm);
    }

    .btn-md {
      padding: var(--spacing-sm) var(--spacing-lg);
      font-size: var(--font-size-base);
    }

    .btn-lg {
      padding: var(--spacing-md) var(--spacing-xl);
      font-size: var(--font-size-lg);
    }

         /* Color variants */
     .btn-primary {
       background: var(--primary-color);
       color: var(--text-inverse);
       box-shadow: var(--shadow-sm);
     }

    .btn-primary:hover:not(:disabled) {
      background: var(--primary-hover);
    }

         .btn-secondary {
       background: var(--bg-secondary);
       color: var(--text-primary);
       border: 1px solid var(--border-primary);
       box-shadow: var(--shadow-sm);
     }

    .btn-secondary:hover:not(:disabled) {
      background: var(--bg-tertiary);
      border-color: var(--primary-color);
    }

    .btn-success {
      background: var(--success-color);
      color: var(--text-inverse);
    }

    .btn-success:hover:not(:disabled) {
      background: #059669;
    }

    .btn-danger {
      background: var(--error-color);
      color: var(--text-inverse);
    }

    .btn-danger:hover:not(:disabled) {
      background: #dc2626;
    }

    .btn-warning {
      background: var(--warning-color);
      color: var(--text-inverse);
    }

    .btn-warning:hover:not(:disabled) {
      background: #d97706;
    }

    .btn-info {
      background: var(--info-color);
      color: var(--text-inverse);
    }

         .btn-info:hover:not(:disabled) {
       background: #2563eb;
     }

     .btn-ghost {
       background: transparent;
       color: var(--text-primary);
       border: 1px solid var(--border-primary);
     }

     .btn-ghost:hover:not(:disabled) {
       background: var(--bg-secondary);
       border-color: var(--primary-color);
     }

     .btn-link {
       background: transparent;
       color: var(--primary-color);
       padding: 0;
     }

     .btn-link:hover:not(:disabled) {
       text-decoration: underline;
     }

    /* Loading state */
    .loading-spinner {
      width: 1rem;
      height: 1rem;
      border: 2px solid transparent;
      border-top: 2px solid currentColor;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    /* Full width */
    .btn-full {
      width: 100%;
    }

    /* Outline variant */
    .btn-outline {
      background: transparent;
      border: 2px solid;
    }

    .btn-outline.btn-primary {
      color: var(--primary-color);
      border-color: var(--primary-color);
    }

    .btn-outline.btn-primary:hover:not(:disabled) {
      background: var(--primary-color);
      color: var(--text-inverse);
    }

    .btn-outline.btn-secondary {
      color: var(--text-primary);
      border-color: var(--border-primary);
    }

    .btn-outline.btn-secondary:hover:not(:disabled) {
      background: var(--bg-secondary);
      border-color: var(--primary-color);
    }
  `]
})
export class ButtonComponent {
  @Input() variant: ButtonVariant = 'primary';
  @Input() size: ButtonSize = 'md';
  @Input() type: ButtonType = 'button';
  @Input() disabled = false;
  @Input() loading = false;
  @Input() fullWidth = false;
  @Input() outline = false;
  @Input() ariaLabel?: string;
  @Input() ariaDescribedby?: string;

  @Output() clicked = new EventEmitter<MouseEvent>();

  get buttonClasses(): string {
    const classes = [
      `btn-${this.variant}`,
      `btn-${this.size}`
    ];

    if (this.fullWidth) {
      classes.push('btn-full');
    }

    if (this.outline) {
      classes.push('btn-outline');
    }

    return classes.join(' ');
  }

  onClick(event: MouseEvent): void {
    if (!this.disabled && !this.loading) {
      this.clicked.emit(event);
    }
  }
} 