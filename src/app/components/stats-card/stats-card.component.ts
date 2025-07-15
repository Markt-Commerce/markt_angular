import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface StatData {
  title: string;
  value: string | number;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
  icon?: string;
  color?: string;
  trend?: 'up' | 'down' | 'stable';
  description?: string;
  format?: 'number' | 'currency' | 'percentage' | 'text';
}

@Component({
  selector: 'app-stats-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stats-card.component.html',
  styleUrl: './stats-card.component.css',
})
export class StatsCardComponent {
  @Input() stat: StatData = {
    title: 'Statistic',
    value: 0,
    format: 'number',
  };
  @Input() loading = false;
  @Input() clickable = false;
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Output() cardClick = new EventEmitter<StatData>();

  getFormattedValue(): string {
    if (this.loading) return '...';

    const value = this.stat.value;
    const format = this.stat.format || 'text';

    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(Number(value));

      case 'number':
        return new Intl.NumberFormat('en-US').format(Number(value));

      case 'percentage':
        return `${value}%`;

      default:
        return String(value);
    }
  }

  getChangeText(): string {
    if (!this.stat.change) return '';

    const sign = this.stat.change >= 0 ? '+' : '';
    return `${sign}${this.stat.change.toFixed(1)}%`;
  }

  getChangeColor(): string {
    if (!this.stat.change) return '#6b7280';

    if (this.stat.change > 0) return '#10b981';
    if (this.stat.change < 0) return '#ef4444';
    return '#6b7280';
  }

  getChangeIcon(): string {
    if (!this.stat.change) return '→';

    if (this.stat.change > 0) return '↗';
    if (this.stat.change < 0) return '↘';
    return '→';
  }

  getCardColor(): string {
    return this.stat.color || '#667eea';
  }

  getIconBackground(): string {
    const color = this.getCardColor();
    return `linear-gradient(135deg, ${color} 0%, ${this.adjustColor(
      color,
      -20
    )} 100%)`;
  }

  private adjustColor(color: string, amount: number): string {
    // Simple color adjustment for gradient
    const hex = color.replace('#', '');
    const num = parseInt(hex, 16);
    const r = Math.min(255, Math.max(0, (num >> 16) + amount));
    const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amount));
    const b = Math.min(255, Math.max(0, (num & 0x0000ff) + amount));
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
  }

  onCardClick() {
    if (this.clickable) {
      this.cardClick.emit(this.stat);
    }
  }

  getSizeClass(): string {
    return `stats-card-${this.size}`;
  }
}
