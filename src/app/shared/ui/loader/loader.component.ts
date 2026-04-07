import { Component, input } from '@angular/core';

@Component({
  selector: 'app-loader',
  standalone: true,
  template: `
    @if (type() === 'spinner') {
      <div class="flex items-center justify-center" [style.padding]="fullPage() ? '4rem 0' : '0'">
        <div
          class="rounded-full border-2 border-surface-700 border-t-primary-500 animate-spin"
          [style.width]="sizeMap[size()]"
          [style.height]="sizeMap[size()]"
        ></div>
      </div>
    } @else {
      <div class="space-y-3" [style.padding]="fullPage() ? '1rem 0' : '0'">
        @for (row of skeletonRows; track $index) {
          <div class="skeleton h-4 rounded" [style.width]="row"></div>
        }
      </div>
    }
  `,
})
export class LoaderComponent {
  readonly type = input<'spinner' | 'skeleton'>('spinner');
  readonly size = input<'sm' | 'md' | 'lg'>('md');
  readonly fullPage = input(false);
  readonly rows = input(3);

  readonly sizeMap: Record<string, string> = {
    sm: '20px',
    md: '32px',
    lg: '48px',
  };

  get skeletonRows(): string[] {
    const widths = ['100%', '85%', '70%', '92%', '60%', '78%'];
    return Array.from({ length: this.rows() }, (_, i) => widths[i % widths.length]);
  }
}
