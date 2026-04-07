import { Component, input } from '@angular/core';
import { NgClass } from '@angular/common';

type BadgeVariant = 'primary' | 'success' | 'danger' | 'warning' | 'info' | 'default';

@Component({
  selector: 'app-badge',
  standalone: true,
  imports: [NgClass],
  template: `
    <span
      [ngClass]="variantClasses[variant()]"
      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
    >
      <ng-content />
    </span>
  `,
})
export class BadgeComponent {
  readonly variant = input<BadgeVariant>('default');

  readonly variantClasses: Record<BadgeVariant, string> = {
    primary: 'bg-primary-500/15 text-primary-400 border border-primary-500/20',
    success: 'bg-accent-500/15 text-accent-400 border border-accent-500/20',
    danger: 'bg-danger-500/15 text-danger-400 border border-danger-500/20',
    warning: 'bg-warning-500/15 text-warning-400 border border-warning-500/20',
    info: 'bg-info-500/15 text-info-400 border border-info-500/20',
    default: 'bg-surface-700/50 text-surface-300 border border-surface-600/50',
  };
}
