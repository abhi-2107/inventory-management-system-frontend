import { Component, inject } from '@angular/core';
import { NgClass } from '@angular/common';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [NgClass],
  template: `
    <div class="fixed top-4 right-4 z-[100] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      @for (toast of toastService.toasts(); track toast.id) {
        <div
          class="pointer-events-auto animate-slide-in-right rounded-xl border p-4 shadow-2xl backdrop-blur-sm"
          [ngClass]="toastStyles[toast.type]"
        >
          <div class="flex items-start gap-3">
            <div class="flex-shrink-0 mt-0.5">
              @switch (toast.type) {
                @case ('success') {
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
                @case ('error') {
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
                @case ('warning') {
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                }
                @case ('info') {
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
              }
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-semibold">{{ toast.title }}</p>
              @if (toast.message) {
                <p class="text-xs mt-1 leading-relaxed opacity-90 break-words">{{ toast.message }}</p>
              }
            </div>
            <button
              (click)="toastService.remove(toast.id)"
              class="flex-shrink-0 p-1 rounded-lg opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      }
    </div>
  `,
})
export class ToastContainerComponent {
  readonly toastService = inject(ToastService);

  readonly toastStyles: Record<string, string> = {
    success: 'bg-accent-600/90 border-accent-500/30 text-white',
    error: 'bg-danger-600/90 border-danger-500/30 text-white',
    warning: 'bg-warning-600/90 border-warning-500/30 text-white',
    info: 'bg-info-600/90 border-info-500/30 text-white',
  };
}
