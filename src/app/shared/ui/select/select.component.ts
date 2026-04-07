import { Component, input, forwardRef } from '@angular/core';
import { NgClass } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-select',
  standalone: true,
  imports: [NgClass],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectComponent),
      multi: true,
    },
  ],
  template: `
    <div class="w-full">
      @if (label()) {
        <label [for]="selectId()" class="block text-sm font-medium text-surface-300 mb-1.5">
          {{ label() }}
          @if (required()) {
            <span class="text-danger-400">*</span>
          }
        </label>
      }
      <div class="relative">
        <select
          [id]="selectId()"
          [disabled]="isDisabled"
          [ngClass]="{
            'border-danger-500': error(),
            'border-surface-600': !error()
          }"
          class="w-full px-4 py-2.5 bg-surface-800/50 border rounded-xl text-surface-100 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 disabled:opacity-50 appearance-none cursor-pointer"
          (change)="onSelectChange($event)"
          (blur)="onTouched()"
        >
          @if (placeholder()) {
            <option value="" disabled [selected]="!value">{{ placeholder() }}</option>
          }
          <ng-content />
        </select>
        <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <svg class="w-4 h-4 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      @if (error()) {
        <p class="mt-1.5 text-xs text-danger-400 animate-fade-in">{{ error() }}</p>
      }
    </div>
  `,
})
export class SelectComponent implements ControlValueAccessor {
  readonly label = input('');
  readonly selectId = input('');
  readonly placeholder = input('');
  readonly error = input('');
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

  onSelectChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.value = target.value;
    this.onChange(this.value);
  }
}
