import { Component, inject, OnInit, signal } from '@angular/core';
import { CardComponent } from '../../shared/ui/card/card.component';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { BadgeComponent } from '../../shared/ui/badge/badge.component';
import { LoaderComponent } from '../../shared/ui/loader/loader.component';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';
import { ModalComponent } from '../../shared/ui/modal/modal.component';
import { InputComponent } from '../../shared/ui/input/input.component';
import { ConfirmDialogComponent } from '../../shared/ui/confirm-dialog/confirm-dialog.component';
import { CategoryService } from '../../core/services/category.service';
import { AuthService } from '../../core/auth/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { Category } from '../../core/models';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [
    CardComponent, ButtonComponent, BadgeComponent, LoaderComponent,
    EmptyStateComponent, ModalComponent, InputComponent, ConfirmDialogComponent,
    ReactiveFormsModule, DatePipe,
  ],
  template: `
    <div class="space-y-6 animate-fade-in">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-surface-100">Categories</h1>
          <p class="text-surface-400 mt-1">Organize your products into categories</p>
        </div>
        <app-button (click)="openCreateModal()" variant="primary">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Add Category
        </app-button>
      </div>

      @if (loading()) {
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          @for (i of [1,2,3]; track i) {
            <app-card>
              <app-loader type="skeleton" [rows]="3" />
            </app-card>
          }
        </div>
      } @else if (categories().length === 0) {
        <app-card>
          <app-empty-state
            title="No categories yet"
            message="Create categories to organize your products."
            actionLabel="Add Category"
            (action)="openCreateModal()"
          />
        </app-card>
      } @else {
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          @for (cat of categories(); track cat.id) {
            <app-card [hoverable]="true">
              <div class="flex items-start justify-between mb-3">
                <div class="w-10 h-10 rounded-xl bg-primary-500/15 flex items-center justify-center">
                  <svg class="w-5 h-5 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
                <div class="flex items-center gap-1">
                  <button
                    (click)="openEditModal(cat)"
                    class="p-2 rounded-lg text-surface-400 hover:text-primary-400 hover:bg-surface-800 transition-colors cursor-pointer"
                  >
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    (click)="confirmDelete(cat)"
                    class="p-2 rounded-lg text-surface-400 hover:text-danger-400 hover:bg-surface-800 transition-colors cursor-pointer"
                  >
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              <h3 class="text-lg font-semibold text-surface-100 mb-1">{{ cat.name }}</h3>
              <p class="text-sm text-surface-400 mb-4 line-clamp-2">{{ cat.description || 'No description' }}</p>

              <div class="flex items-center justify-between pt-3 border-t border-surface-800/50">
                <app-badge variant="primary">{{ cat._count?.products || 0 }} products</app-badge>
                <span class="text-xs text-surface-500">{{ cat.createdAt | date:'mediumDate' }}</span>
              </div>
            </app-card>
          }
        </div>
      }

      <!-- Create/Edit Modal -->
      <app-modal
        [isOpen]="modalOpen()"
        [title]="editingCategory() ? 'Edit Category' : 'Add Category'"
        maxWidth="440px"
        (close)="closeModal()"
      >
        <form [formGroup]="categoryForm" (ngSubmit)="onSubmit()" class="space-y-4">
          <app-input
            label="Category Name"
            inputId="cat-name"
            placeholder="e.g. Electronics"
            formControlName="name"
            [required]="true"
          />
          <app-input
            label="Description"
            inputId="cat-desc"
            placeholder="Optional description"
            formControlName="description"
          />
        </form>

        <div modal-footer>
          <app-button variant="secondary" (click)="closeModal()">Cancel</app-button>
          <app-button
            variant="primary"
            [loading]="saving()"
            [disabled]="categoryForm.invalid"
            (click)="onSubmit()"
          >
            {{ editingCategory() ? 'Update' : 'Create' }}
          </app-button>
        </div>
      </app-modal>

      <!-- Delete Confirmation -->
      <app-confirm-dialog
        [isOpen]="deleteDialogOpen()"
        title="Delete Category"
        [message]="'Are you sure you want to delete &quot;' + (deletingCategory()?.name || '') + '&quot;?'"
        confirmLabel="Delete"
        (confirm)="onDelete()"
        (cancel)="deleteDialogOpen.set(false)"
      />
    </div>
  `,
})
export class CategoriesComponent implements OnInit {
  readonly authService = inject(AuthService);
  private categoryService = inject(CategoryService);
  private toast = inject(ToastService);
  private fb = inject(FormBuilder);

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly categories = signal<Category[]>([]);
  readonly modalOpen = signal(false);
  readonly editingCategory = signal<Category | null>(null);
  readonly deleteDialogOpen = signal(false);
  readonly deletingCategory = signal<Category | null>(null);

  categoryForm = this.fb.nonNullable.group({
    name: ['', Validators.required],
    description: [''],
  });

  ngOnInit(): void {
    this.loadCategories();
  }

  private loadCategories(): void {
    this.categoryService.getAll().subscribe({
      next: (cats) => {
        this.categories.set(cats);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  openCreateModal(): void {
    this.editingCategory.set(null);
    this.categoryForm.reset({ name: '', description: '' });
    this.modalOpen.set(true);
  }

  openEditModal(cat: Category): void {
    this.editingCategory.set(cat);
    this.categoryForm.patchValue({
      name: cat.name,
      description: cat.description || '',
    });
    this.modalOpen.set(true);
  }

  closeModal(): void {
    this.modalOpen.set(false);
    this.editingCategory.set(null);
  }

  onSubmit(): void {
    if (this.categoryForm.invalid) return;
    this.saving.set(true);

    const data = this.categoryForm.getRawValue();
    const editing = this.editingCategory();

    if (editing) {
      this.categoryService.update(editing.id, data).subscribe({
        next: (updated) => {
          this.categories.update((list) => list.map((c) => (c.id === editing.id ? { ...c, ...updated } : c)));
          this.toast.success('Category Updated');
          this.saving.set(false);
          this.closeModal();
        },
        error: (err) => {
          this.toast.error('Update Failed', err.error?.error || 'Something went wrong');
          this.saving.set(false);
        },
      });
    } else {
      this.categoryService.create(data).subscribe({
        next: (newCat) => {
          this.categories.update((list) => [newCat, ...list]);
          this.toast.success('Category Created');
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

  confirmDelete(cat: Category): void {
    this.deletingCategory.set(cat);
    this.deleteDialogOpen.set(true);
  }

  onDelete(): void {
    const cat = this.deletingCategory();
    if (!cat) return;

    this.categoryService.delete(cat.id).subscribe({
      next: () => {
        this.categories.update((list) => list.filter((c) => c.id !== cat.id));
        this.toast.success('Category Deleted');
        this.deleteDialogOpen.set(false);
      },
      error: (err) => {
        this.toast.error('Delete Failed', err.error?.error || 'Something went wrong');
        this.deleteDialogOpen.set(false);
      },
    });
  }
}
