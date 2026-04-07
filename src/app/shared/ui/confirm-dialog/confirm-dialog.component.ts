import { Component, input, output, computed } from '@angular/core';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  template: `
    @if (isVisible()) {
      <div class="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in">
        <div
          class="absolute inset-0 bg-black/60 backdrop-blur-sm"
          (click)="onBackdropClick($event)"
        ></div>
        <div
          class="relative w-full max-w-md bg-surface-900 border border-surface-700/50 rounded-2xl shadow-2xl animate-scale-in p-6"
        >
          <div class="flex flex-col items-center text-center">
            <div
              [class]="
                'w-14 h-14 rounded-full flex items-center justify-center mb-4 ' +
                iconBgClasses[variant()]
              "
            >
              @if (variant() === 'danger') {
                <svg
                  class="w-7 h-7 text-danger-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              } @else {
                <svg
                  class="w-7 h-7 text-primary-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              }
            </div>
            <h3 class="text-lg font-semibold text-surface-100 mb-2">{{ title() }}</h3>
            <p class="text-sm text-surface-400 mb-6">{{ message() }}</p>
            <div class="flex items-center gap-3 w-full">
              <button
                type="button"
                (click)="cancel.emit()"
                [disabled]="loading()"
                class="flex-1 px-4 py-2.5 rounded-xl bg-surface-800 hover:bg-surface-700 text-surface-200 text-sm font-medium transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="button"
                (click)="confirm.emit()"
                [disabled]="loading()"
                [class]="
                  'flex-1 px-4 py-2.5 rounded-xl text-white text-sm font-bold transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ' +
                  confirmButtonClasses[variant()]
                "
              >
                @if (loading()) {
                  <svg class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle
                      class="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      stroke-width="4"
                    ></circle>
                    <path
                      class="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                }
                {{ displayConfirmLabel() }}
              </button>
            </div>
          </div>
        </div>
      </div>
    }
  `,
})
export class ConfirmDialogComponent {
  readonly isOpen = input(false);
  readonly show = input(false);
  readonly title = input('Are you sure?');
  readonly message = input('This action cannot be undone.');
  readonly confirmLabel = input('Delete');
  readonly confirmText = input('Delete');
  readonly variant = input<'primary' | 'danger'>('primary');
  readonly loading = input(false);

  readonly isVisible = computed(() => this.isOpen() || this.show());
  readonly displayConfirmLabel = computed(() =>
    this.confirmLabel() !== 'Delete' ? this.confirmLabel() : this.confirmText(),
  );

  readonly confirm = output<void>();
  readonly cancel = output<void>();

  readonly iconBgClasses = {
    primary: 'bg-primary-500/15',
    danger: 'bg-danger-500/15',
  };

  readonly confirmButtonClasses = {
    primary: 'bg-primary-600 hover:bg-primary-500 shadow-lg shadow-primary-600/20',
    danger: 'bg-danger-600 hover:bg-danger-500 shadow-lg shadow-danger-600/20',
  };

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.cancel.emit();
    }
  }
}
