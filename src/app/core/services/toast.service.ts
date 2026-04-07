import { Injectable, signal } from '@angular/core';
import { ToastMessage } from '../models';

@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly _toasts = signal<ToastMessage[]>([]);
  readonly toasts = this._toasts.asReadonly();

  private counter = 0;

  success(title: string, message?: string): void {
    this.add({ type: 'success', title, message });
  }

  error(title: string, message?: string): void {
    this.add({ type: 'error', title, message, duration: 6000 });
  }

  warning(title: string, message?: string): void {
    this.add({ type: 'warning', title, message });
  }

  info(title: string, message?: string): void {
    this.add({ type: 'info', title, message });
  }

  remove(id: string): void {
    this._toasts.update((toasts) => toasts.filter((t) => t.id !== id));
  }

  private add(toast: Omit<ToastMessage, 'id'>): void {
    const id = `toast-${++this.counter}`;
    const duration = toast.duration || 4000;
    const newToast: ToastMessage = { ...toast, id, duration };

    this._toasts.update((toasts) => [...toasts, newToast]);

    setTimeout(() => this.remove(id), duration);
  }
}
