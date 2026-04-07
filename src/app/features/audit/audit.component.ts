import { Component, inject, OnInit, signal } from '@angular/core';
import { DatePipe, JsonPipe } from '@angular/common';
import { CardComponent } from '../../shared/ui/card/card.component';
import { BadgeComponent } from '../../shared/ui/badge/badge.component';
import { LoaderComponent } from '../../shared/ui/loader/loader.component';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';
import { AuditService } from '../../core/services/audit.service';
import { AuditLog } from '../../core/models';

@Component({
  selector: 'app-audit',
  standalone: true,
  imports: [DatePipe, JsonPipe, CardComponent, BadgeComponent, LoaderComponent, EmptyStateComponent],
  template: `
    <div class="space-y-6 animate-fade-in">
      <!-- Header -->
      <div>
        <h1 class="text-2xl font-bold text-surface-100">Audit Logs</h1>
        <p class="text-surface-400 mt-1">Track all changes and activities across your organization</p>
      </div>

      @if (loading()) {
        <app-card>
          <app-loader type="skeleton" [rows]="6" />
        </app-card>
      } @else if (logs().length === 0) {
        <app-card>
          <app-empty-state
            title="No audit logs"
            message="Activity will appear here as your team makes changes."
          />
        </app-card>
      } @else {
        <app-card padding="none">
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="border-b border-surface-700/50">
                  <th class="text-left px-6 py-4 text-xs font-semibold text-surface-400 uppercase tracking-wider">Timestamp</th>
                  <th class="text-left px-6 py-4 text-xs font-semibold text-surface-400 uppercase tracking-wider">User</th>
                  <th class="text-left px-6 py-4 text-xs font-semibold text-surface-400 uppercase tracking-wider">Action</th>
                  <th class="text-left px-6 py-4 text-xs font-semibold text-surface-400 uppercase tracking-wider">Entity</th>
                  <th class="text-left px-6 py-4 text-xs font-semibold text-surface-400 uppercase tracking-wider">Details</th>
                </tr>
              </thead>
              <tbody>
                @for (log of logs(); track log.id) {
                  <tr class="border-b border-surface-800/30 hover:bg-surface-800/30 transition-colors">
                    <td class="px-6 py-4">
                      <span class="text-sm text-surface-300">{{ log.createdAt | date:'MMM d, y h:mm a' }}</span>
                    </td>
                    <td class="px-6 py-4">
                      <div class="flex items-center gap-2">
                        <div class="w-7 h-7 rounded-full bg-primary-500/15 flex items-center justify-center text-xs font-medium text-primary-400">
                          {{ getInitials(log) }}
                        </div>
                        <span class="text-sm text-surface-200">{{ getUserName(log) }}</span>
                      </div>
                    </td>
                    <td class="px-6 py-4">
                      <app-badge [variant]="getActionVariant(log.action)">
                        {{ formatAction(log.action) }}
                      </app-badge>
                    </td>
                    <td class="px-6 py-4">
                      <span class="text-sm text-surface-300">{{ log.entity }}</span>
                    </td>
                    <td class="px-6 py-4">
                      @if (log.details) {
                        <button
                          (click)="toggleDetails(log.id)"
                          class="text-xs text-primary-400 hover:text-primary-300 transition-colors cursor-pointer"
                        >
                          {{ expandedLog() === log.id ? 'Hide' : 'View' }} Details
                        </button>
                        @if (expandedLog() === log.id) {
                          <pre class="mt-2 text-xs text-surface-400 bg-surface-900 rounded-lg p-3 overflow-x-auto animate-fade-in">{{ log.details | json }}</pre>
                        }
                      } @else {
                        <span class="text-xs text-surface-500">—</span>
                      }
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </app-card>
      }
    </div>
  `,
})
export class AuditComponent implements OnInit {
  private auditService = inject(AuditService);

  readonly loading = signal(true);
  readonly logs = signal<AuditLog[]>([]);
  readonly expandedLog = signal<string | null>(null);

  ngOnInit(): void {
    this.auditService.getLogs().subscribe({
      next: (logs) => {
        this.logs.set(logs);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  toggleDetails(id: string): void {
    this.expandedLog.set(this.expandedLog() === id ? null : id);
  }

  getInitials(log: AuditLog): string {
    if (!log.user) return '?';
    const f = log.user.firstName?.[0] || '';
    const l = log.user.lastName?.[0] || '';
    return (f + l).toUpperCase() || log.user.email[0].toUpperCase();
  }

  getUserName(log: AuditLog): string {
    if (!log.user) return 'Unknown';
    return [log.user.firstName, log.user.lastName].filter(Boolean).join(' ') || log.user.email;
  }

  formatAction(action: string): string {
    return action.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase());
  }

  getActionVariant(action: string): 'success' | 'danger' | 'warning' | 'info' | 'primary' {
    if (action.includes('CREATE')) return 'success';
    if (action.includes('DELETE')) return 'danger';
    if (action.includes('UPDATE') || action.includes('MOVEMENT')) return 'info';
    return 'primary';
  }
}
