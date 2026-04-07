import { Component, input } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [NgClass],
  template: `
    <div
      [ngClass]="{
        'p-6': padding() === 'default',
        'p-4': padding() === 'compact',
        'p-0': padding() === 'none',
        'hover:border-surface-600 hover:shadow-lg hover:shadow-surface-950/50': hoverable()
      }"
      class="bg-surface-800/40 border border-surface-700/50 rounded-2xl transition-all duration-300"
    >
      <ng-content />
    </div>
  `,
})
export class CardComponent {
  readonly padding = input<'default' | 'compact' | 'none'>('default');
  readonly hoverable = input(false);
}
