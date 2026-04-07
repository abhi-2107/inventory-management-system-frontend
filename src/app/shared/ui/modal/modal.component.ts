import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-modal',
  standalone: true,
  template: `
    @if (isOpen()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in" (click)="onBackdropClick($event)">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>

        <!-- Modal Content -->
        <div
          class="relative w-full bg-surface-900 border border-surface-700/50 rounded-2xl shadow-2xl animate-scale-in overflow-hidden"
          [style.max-width]="maxWidth()"
        >
          <!-- Header -->
          <div class="flex items-center justify-between px-6 py-4 border-b border-surface-700/50">
            <h2 class="text-lg font-semibold text-surface-100">{{ title() }}</h2>
            <button
              (click)="close.emit()"
              class="p-1.5 rounded-lg text-surface-400 hover:text-surface-200 hover:bg-surface-800 transition-colors cursor-pointer"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Body -->
          <div class="px-6 py-5 max-h-[70vh] overflow-y-auto">
            <ng-content />
          </div>

          <!-- Footer -->
          @if (showFooter()) {
            <div class="px-6 py-4 border-t border-surface-700/50 flex items-center justify-end gap-3">
              <ng-content select="[modal-footer]" />
            </div>
          }
        </div>
      </div>
    }
  `,
})
export class ModalComponent {
  readonly isOpen = input(false);
  readonly title = input('');
  readonly maxWidth = input('480px');
  readonly showFooter = input(true);

  readonly close = output<void>();

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.close.emit();
    }
  }
}
