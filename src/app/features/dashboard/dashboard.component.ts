import { Component, inject, OnInit, signal, computed, ElementRef, viewChild, AfterViewInit } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { CardComponent } from '../../shared/ui/card/card.component';
import { LoaderComponent } from '../../shared/ui/loader/loader.component';
import { BadgeComponent } from '../../shared/ui/badge/badge.component';
import { ProductService } from '../../core/services/product.service';
import { CategoryService } from '../../core/services/category.service';
import { InventoryService } from '../../core/services/inventory.service';
import { AuthService } from '../../core/auth/auth.service';
import { Product, Category, StockMovement } from '../../core/models';
import { forkJoin } from 'rxjs';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CardComponent, LoaderComponent, BadgeComponent, CurrencyPipe],
  template: `
    <div class="space-y-6 animate-fade-in">
      <!-- Header -->
      <div>
        <h1 class="text-2xl font-bold text-surface-100">Dashboard</h1>
        <p class="text-surface-400 mt-1">Welcome back, {{ authService.userDisplayName() }}. Here's your inventory overview.</p>
      </div>

      @if (loading()) {
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          @for (i of [1,2,3,4]; track i) {
            <app-card>
              <app-loader type="skeleton" [rows]="3" />
            </app-card>
          }
        </div>
      } @else {
        <!-- KPI Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <!-- Total Products -->
          <app-card [hoverable]="true">
            <div class="flex items-start justify-between">
              <div>
                <p class="text-sm font-medium text-surface-400">Total Products</p>
                <p class="text-3xl font-bold text-surface-100 mt-2">{{ products().length }}</p>
                <p class="text-xs text-surface-500 mt-1">Across {{ categories().length }} categories</p>
              </div>
              <div class="w-11 h-11 rounded-xl bg-primary-500/15 flex items-center justify-center">
                <svg class="w-6 h-6 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
            </div>
          </app-card>

          <!-- Total Value -->
          <app-card [hoverable]="true">
            <div class="flex items-start justify-between">
              <div>
                <p class="text-sm font-medium text-surface-400">Inventory Value</p>
                <p class="text-3xl font-bold text-surface-100 mt-2">{{ totalValue() | currency:'USD':'symbol':'1.0-0' }}</p>
                <p class="text-xs text-surface-500 mt-1">Total stock value</p>
              </div>
              <div class="w-11 h-11 rounded-xl bg-accent-500/15 flex items-center justify-center">
                <svg class="w-6 h-6 text-accent-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </app-card>

          <!-- Low Stock -->
          <app-card [hoverable]="true">
            <div class="flex items-start justify-between">
              <div>
                <p class="text-sm font-medium text-surface-400">Low Stock Items</p>
                <p class="text-3xl font-bold text-warning-400 mt-2">{{ lowStockProducts().length }}</p>
                <p class="text-xs text-surface-500 mt-1">Below 10 units</p>
              </div>
              <div class="w-11 h-11 rounded-xl bg-warning-500/15 flex items-center justify-center">
                <svg class="w-6 h-6 text-warning-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>
          </app-card>

          <!-- Out of Stock -->
          <app-card [hoverable]="true">
            <div class="flex items-start justify-between">
              <div>
                <p class="text-sm font-medium text-surface-400">Out of Stock</p>
                <p class="text-3xl font-bold text-danger-400 mt-2">{{ outOfStockProducts().length }}</p>
                <p class="text-xs text-surface-500 mt-1">Need restocking</p>
              </div>
              <div class="w-11 h-11 rounded-xl bg-danger-500/15 flex items-center justify-center">
                <svg class="w-6 h-6 text-danger-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
              </div>
            </div>
          </app-card>
        </div>

        <!-- Charts Row -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <!-- Category Distribution -->
          <app-card>
            <h3 class="text-base font-semibold text-surface-200 mb-4">Products by Category</h3>
            <div class="relative h-64 flex items-center justify-center">
              <canvas #categoryChart></canvas>
            </div>
          </app-card>

          <!-- Stock Overview -->
          <app-card>
            <h3 class="text-base font-semibold text-surface-200 mb-4">Stock Level Overview</h3>
            <div class="relative h-64">
              <canvas #stockChart></canvas>
            </div>
          </app-card>
        </div>

        <!-- Recent Activity & Low Stock Table -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <!-- Recent Movements -->
          <app-card>
            <h3 class="text-base font-semibold text-surface-200 mb-4">Recent Stock Movements</h3>
            @if (movements().length === 0) {
              <p class="text-sm text-surface-500 py-6 text-center">No movements recorded yet.</p>
            } @else {
              <div class="space-y-3">
                @for (m of movements().slice(0, 6); track m.id) {
                  <div class="flex items-center justify-between py-2 border-b border-surface-800/50 last:border-0">
                    <div class="flex items-center gap-3">
                      <div class="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
                        [class]="m.type === 'IN' ? 'bg-accent-500/15 text-accent-400' : m.type === 'OUT' ? 'bg-danger-500/15 text-danger-400' : 'bg-info-500/15 text-info-400'">
                        {{ m.type === 'IN' ? '↑' : m.type === 'OUT' ? '↓' : '⟳' }}
                      </div>
                      <div>
                        <p class="text-sm font-medium text-surface-200">{{ m.product?.name || 'Unknown' }}</p>
                        <p class="text-xs text-surface-500">{{ m.reason || m.type }}</p>
                      </div>
                    </div>
                    <div class="text-right">
                      <app-badge [variant]="m.type === 'IN' ? 'success' : m.type === 'OUT' ? 'danger' : 'info'">
                        {{ m.type === 'IN' ? '+' : m.type === 'OUT' ? '-' : '' }}{{ m.quantity }}
                      </app-badge>
                    </div>
                  </div>
                }
              </div>
            }
          </app-card>

          <!-- Low Stock Alert -->
          <app-card>
            <h3 class="text-base font-semibold text-surface-200 mb-4">Low Stock Alerts</h3>
            @if (lowStockProducts().length === 0) {
              <p class="text-sm text-surface-500 py-6 text-center">All items are well stocked! 🎉</p>
            } @else {
              <div class="space-y-3">
                @for (p of lowStockProducts().slice(0, 6); track p.id) {
                  <div class="flex items-center justify-between py-2 border-b border-surface-800/50 last:border-0">
                    <div>
                      <p class="text-sm font-medium text-surface-200">{{ p.name }}</p>
                      <p class="text-xs text-surface-500">SKU: {{ p.sku }}</p>
                    </div>
                    <div class="flex items-center gap-2">
                      <app-badge [variant]="p.stockQuantity === 0 ? 'danger' : 'warning'">
                        {{ p.stockQuantity }} left
                      </app-badge>
                    </div>
                  </div>
                }
              </div>
            }
          </app-card>
        </div>
      }
    </div>
  `,
})
export class DashboardComponent implements OnInit, AfterViewInit {
  readonly authService = inject(AuthService);
  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);
  private inventoryService = inject(InventoryService);

  readonly categoryChartRef = viewChild<ElementRef<HTMLCanvasElement>>('categoryChart');
  readonly stockChartRef = viewChild<ElementRef<HTMLCanvasElement>>('stockChart');

  readonly loading = signal(true);
  readonly products = signal<Product[]>([]);
  readonly categories = signal<Category[]>([]);
  readonly movements = signal<StockMovement[]>([]);

  readonly totalValue = computed(() =>
    this.products().reduce((sum, p) => sum + (p.price * p.stockQuantity), 0),
  );

  readonly lowStockProducts = computed(() =>
    this.products().filter((p) => p.stockQuantity <= 10).sort((a, b) => a.stockQuantity - b.stockQuantity),
  );

  readonly outOfStockProducts = computed(() =>
    this.products().filter((p) => p.stockQuantity === 0),
  );

  private chartsReady = false;

  ngOnInit(): void {
    this.loadData();
  }

  ngAfterViewInit(): void {
    this.chartsReady = true;
    if (!this.loading()) {
      this.renderCharts();
    }
  }

  private loadData(): void {
    forkJoin({
      products: this.productService.getAll(),
      categories: this.categoryService.getAll(),
      movements: this.inventoryService.getMovements(),
    }).subscribe({
      next: (data) => {
        this.products.set(data.products);
        this.categories.set(data.categories);
        this.movements.set(data.movements);
        this.loading.set(false);
        // Defer chart rendering to next tick to ensure canvas is in DOM
        setTimeout(() => this.renderCharts(), 0);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  private renderCharts(): void {
    this.renderCategoryChart();
    this.renderStockChart();
  }

  private renderCategoryChart(): void {
    const canvas = this.categoryChartRef()?.nativeElement;
    if (!canvas) return;

    const catMap = new Map<string, number>();
    this.products().forEach((p) => {
      const name = p.category?.name || 'Uncategorized';
      catMap.set(name, (catMap.get(name) || 0) + 1);
    });

    const labels = Array.from(catMap.keys());
    const data = Array.from(catMap.values());
    const colors = [
      '#6366f1', '#10b981', '#f59e0b', '#f43f5e', '#0ea5e9',
      '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#64748b',
    ];

    new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: colors.slice(0, labels.length),
          borderWidth: 0,
          hoverOffset: 8,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '65%',
        plugins: {
          legend: {
            position: 'right',
            labels: {
              color: '#94a3b8',
              padding: 16,
              usePointStyle: true,
              pointStyleWidth: 10,
              font: { size: 12, family: 'Inter' },
            },
          },
        },
      },
    });
  }

  private renderStockChart(): void {
    const canvas = this.stockChartRef()?.nativeElement;
    if (!canvas) return;

    const topProducts = [...this.products()]
      .sort((a, b) => b.stockQuantity - a.stockQuantity)
      .slice(0, 8);

    new Chart(canvas, {
      type: 'bar',
      data: {
        labels: topProducts.map((p) => p.name.length > 12 ? p.name.substring(0, 12) + '…' : p.name),
        datasets: [{
          label: 'Stock Qty',
          data: topProducts.map((p) => p.stockQuantity),
          backgroundColor: topProducts.map((p) =>
            p.stockQuantity === 0 ? '#f43f5e' :
            p.stockQuantity <= 10 ? '#f59e0b' :
            '#6366f1',
          ),
          borderRadius: 6,
          barThickness: 24,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: '#64748b', font: { size: 11, family: 'Inter' } },
            border: { display: false },
          },
          y: {
            grid: { color: 'rgba(148,163,184,0.08)' },
            ticks: { color: '#64748b', font: { size: 11, family: 'Inter' } },
            border: { display: false },
          },
        },
      },
    });
  }
}
