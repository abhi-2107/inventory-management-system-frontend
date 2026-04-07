import { Component, input, output, forwardRef } from '@angular/core';
import { NgClass } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [NgClass],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true,
    },
  ],
  template: `
    <div class="w-full group">
      @if (label()) {
        <label [for]="inputId()" class="block text-sm font-semibold text-surface-400 mb-2 group-focus-within:text-primary-400 transition-colors">
          {{ label() }}
          @if (required()) {
            <span class="text-danger-500 ml-0.5">*</span>
          }
        </label>
      }
      <div class="relative">
        <input
          [id]="inputId()"
          [type]="type()"
          [placeholder]="placeholder()"
          [disabled]="isDisabled"
          [value]="value"
          [ngClass]="{
            'border-danger-500/50 focus:border-danger-500 focus:ring-danger-500/10': error(),
            'border-surface-700 focus:border-primary-500 focus:ring-primary-500/10': !error()
          }"
          class="w-full px-4 py-3 bg-surface-900/50 border rounded-xl text-surface-100 placeholder-surface-600 text-sm transition-all duration-300 focus:outline-none focus:ring-4 disabled:opacity-40 disabled:cursor-not-allowed outline-none"
          (input)="onInputChange($event)"
          (blur)="onTouched()"
        />
      </div>
      @if (error()) {
        <p class="mt-2 text-xs text-danger-500 font-medium animate-slide-up flex items-center gap-1.5">
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {{ error() }}
        </p>
      }
      @if (hint() && !error()) {
        <p class="mt-2 text-xs text-surface-500 leading-relaxed">{{ hint() }}</p>
      }
    </div>
  `,
})
export class InputComponent implements ControlValueAccessor {
  readonly label = input('');
  readonly type = input('text');
  readonly placeholder = input('');
  readonly inputId = input('');
  readonly error = input('');
  readonly hint = input('');
  readonly required = input(false);

  value = '';
  isDisabled = false;

  onChange: (value: string) => void = () => {};
  onTouched: () => void = () => {};

  writeValue(value: string): void {
    this.value = value || '';
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  onInputChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.value = target.value;
    this.onChange(this.value);
  }
}
