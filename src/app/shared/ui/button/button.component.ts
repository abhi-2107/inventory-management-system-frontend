import { Component, input } from '@angular/core';
import { NgClass } from '@angular/common';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
type ButtonSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [NgClass],
  template: `
    <button
      [type]="type()"
      [disabled]="disabled() || loading()"
      [ngClass]="[baseClasses, variantClasses[variant()], sizeClasses[size()]]"
      class="relative inline-flex items-center justify-center font-bold rounded-xl transition-all duration-300 focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-500/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer overflow-hidden group"
    >
      @if (loading()) {
        <svg class="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      }
      <span class="relative z-10 flex items-center gap-inherit">
        <ng-content />
      </span>
      
      <!-- Hover effect -->
      <div class="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300 pointer-events-none"></div>
    </button>
  `,
})
export class ButtonComponent {
  readonly variant = input<ButtonVariant>('primary');
  readonly size = input<ButtonSize>('md');
  readonly type = input<'button' | 'submit' | 'reset'>('button');
  readonly disabled = input(false);
  readonly loading = input(false);

  readonly baseClasses = 'select-none';

  readonly variantClasses: Record<ButtonVariant, string> = {
    primary: 'bg-primary-600 hover:bg-primary-500 text-white shadow-lg shadow-primary-600/20 hover:shadow-primary-500/30 active:bg-primary-700',
    secondary: 'bg-surface-700 hover:bg-surface-600 text-surface-100 border border-surface-600 hover:border-surface-500',
    danger: 'bg-danger-600 hover:bg-danger-500 text-white shadow-lg shadow-danger-600/20',
    ghost: 'bg-transparent hover:bg-surface-800 text-surface-300 hover:text-surface-100',
    outline: 'bg-transparent border border-surface-600 hover:border-primary-500 text-surface-200 hover:text-primary-400',
  };

  readonly sizeClasses: Record<ButtonSize, string> = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-5 py-2.5 text-sm gap-2',
    lg: 'px-7 py-3 text-base gap-2.5',
  };
}
