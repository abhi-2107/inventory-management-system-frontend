import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  template: `
    <div class="flex flex-col items-center justify-center py-12 text-center">
      <div class="w-16 h-16 rounded-2xl bg-surface-800 flex items-center justify-center mb-4">
        <svg class="w-8 h-8 text-surface-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
      </div>
      <h3 class="text-lg font-semibold text-surface-200 mb-1">{{ title() }}</h3>
      <p class="text-sm text-surface-500 max-w-sm mb-6">{{ message() }}</p>
      @if (actionLabel()) {
        <button
          (click)="action.emit()"
          class="px-5 py-2.5 bg-primary-600 hover:bg-primary-500 text-white text-sm font-medium rounded-xl transition-colors cursor-pointer"
        >
          {{ actionLabel() }}
        </button>
      }
    </div>
  `,
})
export class EmptyStateComponent {
  readonly title = input('No data found');
  readonly message = input('There are no items to display at the moment.');
  readonly actionLabel = input('');

  readonly action = output<void>();
}
