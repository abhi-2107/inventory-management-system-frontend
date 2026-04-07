import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CardComponent } from '../../shared/ui/card/card.component';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { BadgeComponent } from '../../shared/ui/badge/badge.component';
import { LoaderComponent } from '../../shared/ui/loader/loader.component';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';
import { ModalComponent } from '../../shared/ui/modal/modal.component';
import { InputComponent } from '../../shared/ui/input/input.component';
import { InventoryService } from '../../core/services/inventory.service';
import { ProductService } from '../../core/services/product.service';
import { ToastService } from '../../core/services/toast.service';
import { StockMovement, Product, MovementType } from '../../core/models';

@Component({
  selector: 'app-stock',
  standalone: true,
  imports: [
    DatePipe, FormsModule, ReactiveFormsModule,
    CardComponent, ButtonComponent, BadgeComponent, LoaderComponent,
    EmptyStateComponent, ModalComponent, InputComponent,
  ],
  template: `
    <div class="space-y-6 animate-fade-in">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-surface-100">Stock Movements</h1>
          <p class="text-surface-400 mt-1">Track stock in, out, and adjustments</p>
        </div>
        <app-button (click)="openModal()" variant="primary">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Record Movement
        </app-button>
      </div>

      <!-- Summary Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <app-card [hoverable]="true">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-accent-500/15 flex items-center justify-center">
              <svg class="w-5 h-5 text-accent-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 11l5-5m0 0l5 5m-5-5v12" />
              </svg>
            </div>
            <div>
              <p class="text-2xl font-bold text-surface-100">{{ totalIn() }}</p>
              <p class="text-xs text-surface-400">Total Stock In</p>
            </div>
          </div>
        </app-card>
        <app-card [hoverable]="true">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-danger-500/15 flex items-center justify-center">
              <svg class="w-5 h-5 text-danger-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 13l-5 5m0 0l-5-5m5 5V6" />
              </svg>
            </div>
            <div>
              <p class="text-2xl font-bold text-surface-100">{{ totalOut() }}</p>
              <p class="text-xs text-surface-400">Total Stock Out</p>
            </div>
          </div>
        </app-card>
        <app-card [hoverable]="true">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-info-500/15 flex items-center justify-center">
              <svg class="w-5 h-5 text-info-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <div>
              <p class="text-2xl font-bold text-surface-100">{{ totalAdjustments() }}</p>
              <p class="text-xs text-surface-400">Adjustments</p>
            </div>
          </div>
        </app-card>
      </div>

      <!-- Filter -->
      <app-card padding="compact">
        <div class="flex flex-col sm:flex-row gap-3">
          <select
            [(ngModel)]="productFilter"
            (ngModelChange)="onFilterChange()"
            class="flex-1 px-4 py-2.5 bg-surface-900/50 border border-surface-700/50 rounded-xl text-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 appearance-none cursor-pointer"
          >
            <option value="">All Products</option>
            @for (p of products(); track p.id) {
              <option [value]="p.id">{{ p.name }} ({{ p.sku }})</option>
            }
          </select>
          <select
            [(ngModel)]="typeFilter"
            class="px-4 py-2.5 bg-surface-900/50 border border-surface-700/50 rounded-xl text-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 appearance-none cursor-pointer min-w-[140px]"
          >
            <option value="">All Types</option>
            <option value="IN">Stock In</option>
            <option value="OUT">Stock Out</option>
            <option value="ADJUSTMENT">Adjustment</option>
          </select>
        </div>
      </app-card>

      @if (loading()) {
        <app-card>
          <app-loader type="skeleton" [rows]="5" />
        </app-card>
      } @else if (filteredMovements().length === 0) {
        <app-card>
          <app-empty-state
            title="No movements recorded"
            message="Record your first stock movement to start tracking inventory changes."
            actionLabel="Record Movement"
            (action)="openModal()"
          />
        </app-card>
      } @else {
        <app-card padding="none">
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="border-b border-surface-700/50">
                  <th class="text-left px-6 py-4 text-xs font-semibold text-surface-400 uppercase tracking-wider">Date</th>
                  <th class="text-left px-6 py-4 text-xs font-semibold text-surface-400 uppercase tracking-wider">Product</th>
                  <th class="text-left px-6 py-4 text-xs font-semibold text-surface-400 uppercase tracking-wider">Type</th>
                  <th class="text-right px-6 py-4 text-xs font-semibold text-surface-400 uppercase tracking-wider">Quantity</th>
                  <th class="text-left px-6 py-4 text-xs font-semibold text-surface-400 uppercase tracking-wider">Reason</th>
                </tr>
              </thead>
              <tbody>
                @for (m of filteredMovements(); track m.id) {
                  <tr class="border-b border-surface-800/30 hover:bg-surface-800/30 transition-colors">
                    <td class="px-6 py-4">
                      <span class="text-sm text-surface-300">{{ m.createdAt | date:'MMM d, y h:mm a' }}</span>
                    </td>
                    <td class="px-6 py-4">
                      <p class="text-sm font-medium text-surface-200">{{ m.product?.name || '—' }}</p>
                    </td>
                    <td class="px-6 py-4">
                      <app-badge [variant]="m.type === 'IN' ? 'success' : m.type === 'OUT' ? 'danger' : 'info'">
                        {{ m.type }}
                      </app-badge>
                    </td>
                    <td class="px-6 py-4 text-right">
                      <span class="text-sm font-semibold" [class]="m.type === 'IN' ? 'text-accent-400' : m.type === 'OUT' ? 'text-danger-400' : 'text-info-400'">
                        {{ m.type === 'IN' ? '+' : m.type === 'OUT' ? '-' : '' }}{{ m.quantity }}
                      </span>
                    </td>
                    <td class="px-6 py-4">
                      <span class="text-sm text-surface-400">{{ m.reason || '—' }}</span>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </app-card>
      }

      <!-- Record Movement Modal -->
      <app-modal
        [isOpen]="modalOpen()"
        title="Record Stock Movement"
        maxWidth="480px"
        (close)="closeModal()"
      >
        <form [formGroup]="movementForm" (ngSubmit)="onSubmit()" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-surface-300 mb-1.5">Product <span class="text-danger-400">*</span></label>
            <select
              formControlName="productId"
              class="w-full px-4 py-2.5 bg-surface-800/50 border border-surface-600 rounded-xl text-surface-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 appearance-none cursor-pointer"
            >
              <option value="" disabled>Select a product</option>
              @for (p of products(); track p.id) {
                <option [value]="p.id">{{ p.name }} (Stock: {{ p.stockQuantity }})</option>
              }
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-surface-300 mb-1.5">Movement Type <span class="text-danger-400">*</span></label>
            <div class="grid grid-cols-3 gap-2">
              @for (type of movementTypes; track type.value) {
                <button
                  type="button"
                  (click)="movementForm.patchValue({ type: type.value })"
                  [class]="movementForm.get('type')?.value === type.value
                    ? 'px-3 py-2.5 rounded-xl text-sm font-medium border-2 transition-all cursor-pointer ' + type.activeClass
                    : 'px-3 py-2.5 rounded-xl text-sm font-medium border border-surface-600 text-surface-400 hover:border-surface-500 transition-all cursor-pointer'"
                >
                  {{ type.label }}
                </button>
              }
            </div>
          </div>

          <app-input
            label="Quantity"
            type="number"
            inputId="mv-qty"
            placeholder="Enter quantity"
            formControlName="quantity"
            [required]="true"
          />

          <app-input
            label="Reason"
            inputId="mv-reason"
            placeholder="Optional reason"
            formControlName="reason"
          />
        </form>

        <div modal-footer>
          <app-button variant="secondary" (click)="closeModal()">Cancel</app-button>
          <app-button variant="primary" [loading]="saving()" [disabled]="movementForm.invalid" (click)="onSubmit()">
            Record
          </app-button>
        </div>
      </app-modal>
    </div>
  `,
})
export class StockComponent implements OnInit {
  private inventoryService = inject(InventoryService);
  private productService = inject(ProductService);
  private toast = inject(ToastService);
  private fb = inject(FormBuilder);

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly modalOpen = signal(false);
  readonly movements = signal<StockMovement[]>([]);
  readonly products = signal<Product[]>([]);

  productFilter = '';
  typeFilter = '';

  readonly movementTypes = [
    { value: 'IN' as MovementType, label: 'Stock In', activeClass: 'border-accent-500 bg-accent-500/15 text-accent-400' },
    { value: 'OUT' as MovementType, label: 'Stock Out', activeClass: 'border-danger-500 bg-danger-500/15 text-danger-400' },
    { value: 'ADJUSTMENT' as MovementType, label: 'Adjust', activeClass: 'border-info-500 bg-info-500/15 text-info-400' },
  ];

  readonly filteredMovements = computed(() => {
    let items = this.movements();
    if (this.typeFilter) {
      items = items.filter((m) => m.type === this.typeFilter);
    }
    return items;
  });

  readonly totalIn = computed(() =>
    this.movements().filter((m) => m.type === 'IN').reduce((sum, m) => sum + Math.abs(m.quantity), 0),
  );
  readonly totalOut = computed(() =>
    this.movements().filter((m) => m.type === 'OUT').reduce((sum, m) => sum + Math.abs(m.quantity), 0),
  );
  readonly totalAdjustments = computed(() =>
    this.movements().filter((m) => m.type === 'ADJUSTMENT').length,
  );

  movementForm = this.fb.nonNullable.group({
    productId: ['', Validators.required],
    type: ['IN' as MovementType, Validators.required],
    quantity: [1, [Validators.required, Validators.min(1)]],
    reason: [''],
  });

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    this.productService.getAll().subscribe({
      next: (products) => this.products.set(products),
    });
    this.loadMovements();
  }

  private loadMovements(): void {
    this.inventoryService.getMovements(this.productFilter || undefined).subscribe({
      next: (movements) => {
        this.movements.set(movements);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  onFilterChange(): void {
    this.loading.set(true);
    this.loadMovements();
  }

  openModal(): void {
    this.movementForm.reset({ productId: '', type: 'IN', quantity: 1, reason: '' });
    this.modalOpen.set(true);
  }

  closeModal(): void {
    this.modalOpen.set(false);
  }

  onSubmit(): void {
    if (this.movementForm.invalid) return;
    this.saving.set(true);

    const raw = this.movementForm.getRawValue();
    const data = { ...raw, quantity: Number(raw.quantity) };

    this.inventoryService.recordMovement(data).subscribe({
      next: (res) => {
        // Update local product stock
        this.products.update((list) =>
          list.map((p) => (p.id === res.updatedProduct.id ? res.updatedProduct : p)),
        );
        this.toast.success('Movement Recorded', `Stock updated for ${res.updatedProduct.name}`);
        this.saving.set(false);
        this.closeModal();
        // Reload movements
        this.loading.set(true);
        this.loadMovements();
      },
      error: (err) => {
        this.toast.error('Failed', err.error?.error || 'Something went wrong');
        this.saving.set(false);
      },
    });
  }
}
