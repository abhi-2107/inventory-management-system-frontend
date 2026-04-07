import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardComponent } from '../../shared/ui/card/card.component';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { BadgeComponent } from '../../shared/ui/badge/badge.component';
import { LoaderComponent } from '../../shared/ui/loader/loader.component';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';
import { ModalComponent } from '../../shared/ui/modal/modal.component';
import { InputComponent } from '../../shared/ui/input/input.component';
import { SelectComponent } from '../../shared/ui/select/select.component';
import { ConfirmDialogComponent } from '../../shared/ui/confirm-dialog/confirm-dialog.component';
import { ProductService } from '../../core/services/product.service';
import { CategoryService } from '../../core/services/category.service';
import { AuthService } from '../../core/auth/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { Product, Category } from '../../core/models';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [
    CurrencyPipe, FormsModule, ReactiveFormsModule,
    CardComponent, ButtonComponent, BadgeComponent, LoaderComponent,
    EmptyStateComponent, ModalComponent, InputComponent,
    ConfirmDialogComponent,
  ],
  template: `
    <div class="space-y-6 animate-fade-in">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-surface-100">Products</h1>
          <p class="text-surface-400 mt-1">Manage your product catalog</p>
        </div>
        @if (authService.isManager()) {
          <app-button (click)="openCreateModal()" variant="primary">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Add Product
          </app-button>
        }
      </div>

      <!-- Search & Filter Bar -->
      <app-card padding="compact">
        <div class="flex flex-col sm:flex-row gap-3">
          <div class="relative flex-1">
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search products by name or SKU..."
              [(ngModel)]="searchQuery"
              class="w-full pl-10 pr-4 py-2.5 bg-surface-900/50 border border-surface-700/50 rounded-xl text-surface-200 text-sm placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
            />
          </div>
          <select
            [(ngModel)]="categoryFilter"
            class="px-4 py-2.5 bg-surface-900/50 border border-surface-700/50 rounded-xl text-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 appearance-none cursor-pointer min-w-[160px]"
          >
            <option value="">All Categories</option>
            @for (cat of categories(); track cat.id) {
              <option [value]="cat.id">{{ cat.name }}</option>
            }
          </select>
        </div>
      </app-card>

      @if (loading()) {
        <app-card>
          <app-loader type="skeleton" [rows]="5" />
        </app-card>
      } @else if (filteredProducts().length === 0) {
        <app-card>
          <app-empty-state
            [title]="searchQuery || categoryFilter ? 'No matching products' : 'No products yet'"
            [message]="searchQuery || categoryFilter ? 'Try adjusting your search or filters.' : 'Start by adding your first product to the inventory.'"
            [actionLabel]="authService.isManager() && !searchQuery && !categoryFilter ? 'Add Product' : ''"
            (action)="openCreateModal()"
          />
        </app-card>
      } @else {
        <!-- Products Table -->
        <app-card padding="none">
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="border-b border-surface-700/50">
                  <th class="text-left px-6 py-4 text-xs font-semibold text-surface-400 uppercase tracking-wider">Product</th>
                  <th class="text-left px-6 py-4 text-xs font-semibold text-surface-400 uppercase tracking-wider">SKU</th>
                  <th class="text-left px-6 py-4 text-xs font-semibold text-surface-400 uppercase tracking-wider">Category</th>
                  <th class="text-right px-6 py-4 text-xs font-semibold text-surface-400 uppercase tracking-wider">Price</th>
                  <th class="text-right px-6 py-4 text-xs font-semibold text-surface-400 uppercase tracking-wider">Stock</th>
                  @if (authService.isManager()) {
                    <th class="text-right px-6 py-4 text-xs font-semibold text-surface-400 uppercase tracking-wider">Actions</th>
                  }
                </tr>
              </thead>
              <tbody>
                @for (product of paginatedProducts(); track product.id) {
                  <tr class="border-b border-surface-800/30 hover:bg-surface-800/30 transition-colors">
                    <td class="px-6 py-4">
                      <div>
                        <p class="text-sm font-medium text-surface-100">{{ product.name }}</p>
                        @if (product.description) {
                          <p class="text-xs text-surface-500 mt-0.5 truncate max-w-xs">{{ product.description }}</p>
                        }
                      </div>
                    </td>
                    <td class="px-6 py-4">
                      <span class="text-sm text-surface-300 font-mono">{{ product.sku }}</span>
                    </td>
                    <td class="px-6 py-4">
                      <app-badge [variant]="product.category ? 'primary' : 'default'">
                        {{ product.category?.name || 'Uncategorized' }}
                      </app-badge>
                    </td>
                    <td class="px-6 py-4 text-right">
                      <span class="text-sm font-medium text-surface-200">{{ product.price | currency:'USD' }}</span>
                    </td>
                    <td class="px-6 py-4 text-right">
                      <app-badge
                        [variant]="product.stockQuantity === 0 ? 'danger' : product.stockQuantity <= 10 ? 'warning' : 'success'"
                      >
                        {{ product.stockQuantity }}
                      </app-badge>
                    </td>
                    @if (authService.isManager()) {
                      <td class="px-6 py-4 text-right">
                        <div class="flex items-center justify-end gap-2">
                          <button
                            (click)="openEditModal(product)"
                            class="p-2 rounded-lg text-surface-400 hover:text-primary-400 hover:bg-surface-800 transition-colors cursor-pointer"
                            title="Edit"
                          >
                            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          @if (authService.isAdmin()) {
                            <button
                              (click)="confirmDelete(product)"
                              class="p-2 rounded-lg text-surface-400 hover:text-danger-400 hover:bg-surface-800 transition-colors cursor-pointer"
                              title="Delete"
                            >
                              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          }
                        </div>
                      </td>
                    }
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          @if (totalPages() > 1) {
            <div class="flex items-center justify-between px-6 py-4 border-t border-surface-800/30">
              <p class="text-sm text-surface-500">
                Showing {{ (currentPage() - 1) * pageSize + 1 }}-{{ Math.min(currentPage() * pageSize, filteredProducts().length) }}
                of {{ filteredProducts().length }}
              </p>
              <div class="flex items-center gap-2">
                <button
                  (click)="currentPage.set(currentPage() - 1)"
                  [disabled]="currentPage() === 1"
                  class="px-3 py-1.5 rounded-lg text-sm text-surface-400 hover:text-surface-200 hover:bg-surface-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  Previous
                </button>
                @for (page of pageNumbers(); track page) {
                  <button
                    (click)="currentPage.set(page)"
                    [class]="page === currentPage()
                      ? 'px-3 py-1.5 rounded-lg text-sm bg-primary-600 text-white font-medium cursor-pointer'
                      : 'px-3 py-1.5 rounded-lg text-sm text-surface-400 hover:text-surface-200 hover:bg-surface-800 cursor-pointer transition-colors'"
                  >
                    {{ page }}
                  </button>
                }
                <button
                  (click)="currentPage.set(currentPage() + 1)"
                  [disabled]="currentPage() === totalPages()"
                  class="px-3 py-1.5 rounded-lg text-sm text-surface-400 hover:text-surface-200 hover:bg-surface-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  Next
                </button>
              </div>
            </div>
          }
        </app-card>
      }

      <!-- Create/Edit Modal -->
      <app-modal
        [isOpen]="modalOpen()"
        [title]="editingProduct() ? 'Edit Product' : 'Add Product'"
        maxWidth="520px"
        (close)="closeModal()"
      >
        <form [formGroup]="productForm" (ngSubmit)="onSubmit()" class="space-y-4">
          <app-input
            label="Product Name"
            inputId="prod-name"
            placeholder="Enter product name"
            formControlName="name"
            [required]="true"
          />
          <app-input
            label="SKU"
            inputId="prod-sku"
            placeholder="e.g. PRD-001"
            formControlName="sku"
            [required]="true"
            [disabled]="!!editingProduct()"
          />
          <app-input
            label="Description"
            inputId="prod-desc"
            placeholder="Optional description"
            formControlName="description"
          />
          <div class="grid grid-cols-2 gap-4">
            <app-input
              label="Price"
              type="number"
              inputId="prod-price"
              placeholder="0.00"
              formControlName="price"
              [required]="true"
            />
            <div>
              <label class="block text-sm font-medium text-surface-300 mb-1.5">Category</label>
              <select
                formControlName="categoryId"
                class="w-full px-4 py-2.5 bg-surface-800/50 border border-surface-600 rounded-xl text-surface-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 appearance-none cursor-pointer"
              >
                <option value="">No Category</option>
                @for (cat of categories(); track cat.id) {
                  <option [value]="cat.id">{{ cat.name }}</option>
                }
              </select>
            </div>
          </div>
        </form>

        <div modal-footer>
          <app-button variant="secondary" (click)="closeModal()">Cancel</app-button>
          <app-button
            variant="primary"
            [loading]="saving()"
            [disabled]="productForm.invalid"
            (click)="onSubmit()"
          >
            {{ editingProduct() ? 'Update' : 'Create' }}
          </app-button>
        </div>
      </app-modal>

      <!-- Delete Confirmation -->
      <app-confirm-dialog
        [isOpen]="deleteDialogOpen()"
        title="Delete Product"
        [message]="'Are you sure you want to delete &quot;' + (deletingProduct()?.name || '') + '&quot;? This action cannot be undone.'"
        confirmLabel="Delete"
        (confirm)="onDelete()"
        (cancel)="deleteDialogOpen.set(false)"
      />
    </div>
  `,
})
export class ProductsComponent implements OnInit {
  readonly authService = inject(AuthService);
  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);
  private toast = inject(ToastService);
  private fb = inject(FormBuilder);

  readonly Math = Math;

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly products = signal<Product[]>([]);
  readonly categories = signal<Category[]>([]);
  readonly modalOpen = signal(false);
  readonly editingProduct = signal<Product | null>(null);
  readonly deleteDialogOpen = signal(false);
  readonly deletingProduct = signal<Product | null>(null);

  searchQuery = '';
  categoryFilter = '';

  readonly currentPage = signal(1);
  readonly pageSize = 10;

  readonly filteredProducts = computed(() => {
    let items = this.products();
    const query = this.searchQuery.toLowerCase().trim();
    if (query) {
      items = items.filter(
        (p) => p.name.toLowerCase().includes(query) || p.sku.toLowerCase().includes(query),
      );
    }
    if (this.categoryFilter) {
      items = items.filter((p) => p.categoryId === this.categoryFilter);
    }
    return items;
  });

  readonly totalPages = computed(() => Math.ceil(this.filteredProducts().length / this.pageSize));

  readonly paginatedProducts = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.filteredProducts().slice(start, start + this.pageSize);
  });

  readonly pageNumbers = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: number[] = [];
    const start = Math.max(1, current - 2);
    const end = Math.min(total, current + 2);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  });

  productForm = this.fb.nonNullable.group({
    name: ['', Validators.required],
    sku: ['', Validators.required],
    description: [''],
    price: [0, [Validators.required, Validators.min(0.01)]],
    categoryId: [''],
  });

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    this.productService.getAll().subscribe({
      next: (products) => {
        this.products.set(products);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
    this.categoryService.getAll().subscribe({
      next: (cats) => this.categories.set(cats),
    });
  }

  openCreateModal(): void {
    this.editingProduct.set(null);
    this.productForm.reset({ name: '', sku: '', description: '', price: 0, categoryId: '' });
    this.productForm.get('sku')?.enable();
    this.modalOpen.set(true);
  }

  openEditModal(product: Product): void {
    this.editingProduct.set(product);
    this.productForm.patchValue({
      name: product.name,
      sku: product.sku,
      description: product.description || '',
      price: product.price,
      categoryId: product.categoryId || '',
    });
    this.productForm.get('sku')?.disable();
    this.modalOpen.set(true);
  }

  closeModal(): void {
    this.modalOpen.set(false);
    this.editingProduct.set(null);
  }

  onSubmit(): void {
    if (this.productForm.invalid) return;
    this.saving.set(true);

    const raw = this.productForm.getRawValue();
    const data = {
      ...raw,
      price: Number(raw.price),
      categoryId: raw.categoryId || undefined,
    };

    const editing = this.editingProduct();
    if (editing) {
      const { sku, ...updateData } = data;
      this.productService.update(editing.id, updateData).subscribe({
        next: (updated) => {
          this.products.update((list) => list.map((p) => (p.id === editing.id ? { ...p, ...updated } : p)));
          this.toast.success('Product Updated');
          this.saving.set(false);
          this.closeModal();
        },
        error: (err) => {
          this.toast.error('Update Failed', err.error?.error || 'Something went wrong');
          this.saving.set(false);
        },
      });
    } else {
      this.productService.create(data).subscribe({
        next: (newProduct) => {
          this.products.update((list) => [newProduct, ...list]);
          this.toast.success('Product Created');
          this.saving.set(false);
          this.closeModal();
        },
        error: (err) => {
          this.toast.error('Create Failed', err.error?.error || 'Something went wrong');
          this.saving.set(false);
        },
      });
    }
  }

  confirmDelete(product: Product): void {
    this.deletingProduct.set(product);
    this.deleteDialogOpen.set(true);
  }

  onDelete(): void {
    const product = this.deletingProduct();
    if (!product) return;

    this.productService.delete(product.id).subscribe({
      next: () => {
        this.products.update((list) => list.filter((p) => p.id !== product.id));
        this.toast.success('Product Deleted');
        this.deleteDialogOpen.set(false);
        this.deletingProduct.set(null);
      },
      error: (err) => {
        this.toast.error('Delete Failed', err.error?.error || 'Something went wrong');
        this.deleteDialogOpen.set(false);
      },
    });
  }
}
