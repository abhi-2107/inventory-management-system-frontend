import { Component, signal, inject, computed, effect } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { NgClass } from '@angular/common';
import { filter, map } from 'rxjs';
import { AuthService } from '../../core/auth/auth.service';

interface NavItem {
  label: string;
  route: string;
  icon: string;
  roles?: string[];
}

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NgClass],
  template: `
    <div class="min-h-screen bg-surface-950 flex">
      <!-- Sidebar -->
      <aside
        [ngClass]="{ 'w-64': !collapsed(), 'w-20': collapsed() }"
        class="fixed top-0 left-0 h-full bg-surface-900/80 border-r border-surface-800 z-40 transition-all duration-300 flex flex-col backdrop-blur-sm"
      >
        <!-- Logo -->
        <div class="h-16 flex items-center px-5 border-b border-surface-800/50">
          <a routerLink="/dashboard" class="flex items-center gap-3 overflow-hidden">
            <div
              class="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0"
            >
              <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
            </div>
            @if (!collapsed()) {
              <span class="text-lg font-bold text-white whitespace-nowrap">InvenTrack</span>
            }
          </a>
        </div>

        <!-- Navigation -->
        <nav class="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          @for (item of filteredNavItems(); track item.route) {
            <a
              [routerLink]="item.route"
              routerLinkActive="bg-primary-600/15 text-primary-400 border-primary-500/20"
              [routerLinkActiveOptions]="{ exact: item.route === '/dashboard' }"
              [ngClass]="{ 'justify-center': collapsed() }"
              class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-surface-400 hover:text-surface-100 hover:bg-surface-800/60 border border-transparent transition-all duration-200 group"
            >
              <span class="flex-shrink-0 w-5 h-5" [innerHTML]="item.icon"></span>
              @if (!collapsed()) {
                <span class="whitespace-nowrap">{{ item.label }}</span>
              }
            </a>
          }
        </nav>

        <!-- Collapse Toggle -->
        <div class="px-3 py-3 border-t border-surface-800/50">
          <button
            (click)="collapsed.set(!collapsed())"
            [ngClass]="{ 'justify-center': collapsed() }"
            class="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-surface-400 hover:text-surface-100 hover:bg-surface-800/60 transition-colors cursor-pointer"
          >
            <svg
              class="w-5 h-5 transition-transform duration-300"
              [ngClass]="{ 'rotate-180': collapsed() }"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
              />
            </svg>
            @if (!collapsed()) {
              <span>Collapse</span>
            }
          </button>
        </div>
      </aside>

      <!-- Main Content -->
      <div
        [ngClass]="{ 'ml-64': !collapsed(), 'ml-20': collapsed() }"
        class="flex-1 transition-all duration-300 flex flex-col min-h-screen"
      >
        <!-- Top Bar -->
        <header
          class="h-16 bg-surface-900/50 backdrop-blur-sm border-b border-surface-800/50 flex items-center justify-between px-6 sticky top-0 z-30"
        >
          <div>
            <h2 class="text-lg font-semibold text-surface-100">
              {{ pageTitle() }}
            </h2>
          </div>

          <div class="flex items-center gap-4">
            <!-- Org Name -->
            <div
              class="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-800/50 border border-surface-700/50"
            >
              <svg
                class="w-4 h-4 text-primary-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
              <span class="text-sm text-surface-300">{{ authService.organization()?.name }}</span>
            </div>

            <!-- User Menu -->
            <div class="relative">
              <button
                (click)="userMenuOpen.set(!userMenuOpen())"
                class="flex items-center gap-3 px-2 py-1.5 rounded-xl hover:bg-surface-800/60 transition-colors cursor-pointer"
              >
                <div
                  class="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-sm font-semibold text-white"
                >
                  {{ authService.userInitials() }}
                </div>
                @if (!collapsed()) {
                  <div class="hidden md:block text-left">
                    <p class="text-sm font-medium text-surface-200 leading-none">
                      {{ authService.userDisplayName() }}
                    </p>
                    <p class="text-xs text-surface-500 mt-0.5">{{ authService.role() }}</p>
                  </div>
                }
              </button>

              @if (userMenuOpen()) {
                <div
                  class="absolute right-0 top-full mt-2 w-56 bg-surface-800 border border-surface-700/50 rounded-xl shadow-2xl py-2 animate-scale-in z-50"
                >
                  <div class="px-4 py-2 border-b border-surface-700/50">
                    <p class="text-sm font-medium text-surface-200">
                      {{ authService.userDisplayName() }}
                    </p>
                    <p class="text-xs text-surface-500">{{ authService.user()?.email }}</p>
                  </div>
                  <button
                    (click)="logout()"
                    class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-danger-400 hover:bg-surface-700/50 transition-colors cursor-pointer"
                  >
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    Sign Out
                  </button>
                </div>
              }
            </div>
          </div>
        </header>

        <!-- Page Content -->
        <main class="flex-1 p-6">
          <router-outlet />
        </main>
      </div>

      <!-- Overlay for mobile -->
      @if (userMenuOpen()) {
        <div class="fixed inset-0 z-20" (click)="userMenuOpen.set(false)"></div>
      }
    </div>
  `,
})
export class MainLayoutComponent {
  readonly authService = inject(AuthService);
  private router = inject(Router);

  readonly collapsed = signal(false);
  readonly userMenuOpen = signal(false);

  readonly navItems: NavItem[] = [
    {
      label: 'Dashboard',
      route: '/dashboard',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>',
    },
    {
      label: 'Products',
      route: '/products',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>',
    },
    {
      label: 'Categories',
      route: '/categories',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6h16M4 12h16M4 18h7"/></svg>',
    },
    {
      label: 'Stock Movements',
      route: '/stock',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>',
    },
    {
      label: 'Audit Logs',
      route: '/audit',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>',
      roles: ['ADMIN'],
    },
    {
      label: 'Settings',
      route: '/settings',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/></svg>',
    },
  ];

  readonly filteredNavItems = computed(() => {
    const role = this.authService.role();
    return this.navItems.filter((item) => {
      if (!item.roles) return true;
      return role && item.roles.includes(role);
    });
  });

  readonly pageTitle = signal('Dashboard');

  constructor() {
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        map((event: any) => event.urlAfterRedirects),
      )
      .subscribe((url) => {
        const item = this.navItems.find((i) => url.startsWith(i.route));
        if (item) {
          this.pageTitle.set(item.label);
        }
      });
  }

  logout(): void {
    this.userMenuOpen.set(false);
    this.authService.logout();
  }
}
