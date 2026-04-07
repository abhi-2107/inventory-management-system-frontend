import { Component, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CardComponent } from '../../shared/ui/card/card.component';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { BadgeComponent } from '../../shared/ui/badge/badge.component';
import { LoaderComponent } from '../../shared/ui/loader/loader.component';
import { InputComponent } from '../../shared/ui/input/input.component';
import { SelectComponent } from '../../shared/ui/select/select.component';
import { ConfirmDialogComponent } from '../../shared/ui/confirm-dialog/confirm-dialog.component';
import { OrganizationService } from '../../core/services/organization.service';
import { AuthService } from '../../core/auth/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { Organization, Member, Role } from '../../core/models';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    DatePipe,
    CardComponent,
    ButtonComponent,
    BadgeComponent,
    LoaderComponent,
    InputComponent,
    SelectComponent,
    ConfirmDialogComponent,
  ],
  template: `
    <div class="space-y-6 animate-fade-in">
      <!-- Header -->
      <div>
        <h1 class="text-2xl font-bold text-surface-100">Organization Settings</h1>
        <p class="text-surface-400 mt-1">Manage your team and organization details</p>
      </div>

      @if (loading()) {
        <app-card>
          <app-loader type="skeleton" [rows]="5" />
        </app-card>
      } @else {
        <!-- Organization Details -->
        <app-card>
          <h3 class="text-lg font-semibold text-surface-100 mb-4">Organization Profile</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p class="text-sm text-surface-400">Organization Name</p>
              <p class="text-base font-medium text-surface-200 mt-1">{{ organization()?.name }}</p>
            </div>
            <div>
              <p class="text-sm text-surface-400">Organization Slug</p>
              <p class="text-base font-medium text-surface-200 mt-1">{{ organization()?.slug }}</p>
            </div>
            <div>
              <p class="text-sm text-surface-400">Total Members</p>
              <p class="text-base font-medium text-surface-200 mt-1">
                {{ organization()?._count?.members }}
              </p>
            </div>
            <div>
              <p class="text-sm text-surface-400">Total Products</p>
              <p class="text-base font-medium text-surface-200 mt-1">
                {{ organization()?._count?.products }}
              </p>
            </div>
          </div>
        </app-card>

        <!-- Team Management -->
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-surface-100">Team Members</h3>
            @if (authService.isAdmin()) {
              <app-button
                (click)="showAddMember.set(!showAddMember())"
                variant="secondary"
                size="sm"
              >
                {{ showAddMember() ? 'Cancel' : 'Invite Member' }}
              </app-button>
            }
          </div>

          @if (showAddMember() && authService.isAdmin()) {
            <app-card class="animate-slide-up">
              <h4 class="text-sm font-semibold text-surface-200 mb-4">Invite New Member</h4>
              <form [formGroup]="memberForm" (ngSubmit)="onAddMember()" class="space-y-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <app-input
                    label="First Name"
                    inputId="member-first"
                    placeholder="John"
                    formControlName="firstName"
                    [required]="true"
                    [error]="getMemberError('firstName')"
                  />
                  <app-input
                    label="Last Name"
                    inputId="member-last"
                    placeholder="Doe"
                    formControlName="lastName"
                    [required]="true"
                    [error]="getMemberError('lastName')"
                  />
                </div>
                <div class="flex flex-col md:flex-row gap-4 items-end">
                  <div class="flex-1 w-full">
                    <app-input
                      label="Email Address"
                      inputId="member-email"
                      placeholder="teammate@example.com"
                      formControlName="email"
                      [required]="true"
                      [error]="getMemberError('email')"
                    />
                  </div>
                  <div class="w-full md:w-48">
                    <app-select
                      label="Role"
                      selectId="member-role"
                      formControlName="role"
                      [required]="true"
                    >
                      <option value="ADMIN">Admin</option>
                      <option value="MANAGER">Manager</option>
                      <option value="STAFF">Staff</option>
                    </app-select>
                  </div>
                  <app-button
                    type="submit"
                    [loading]="addingMember()"
                    [disabled]="memberForm.invalid"
                    variant="primary"
                  >
                    Send Invitation
                  </app-button>
                </div>
              </form>
            </app-card>
          }

          <app-card padding="none">
            <div class="overflow-x-auto">
              <table class="w-full border-collapse">
                <thead>
                  <tr class="border-b border-surface-700/50">
                    <th
                      class="text-left px-6 py-4 text-xs font-semibold text-surface-400 uppercase tracking-wider"
                    >
                      Member
                    </th>
                    <th
                      class="text-left px-6 py-4 text-xs font-semibold text-surface-400 uppercase tracking-wider"
                    >
                      Email
                    </th>
                    <th
                      class="text-left px-6 py-4 text-xs font-semibold text-surface-400 uppercase tracking-wider"
                    >
                      Role
                    </th>
                    <th
                      class="text-left px-6 py-4 text-xs font-semibold text-surface-400 uppercase tracking-wider"
                    >
                      Joined
                    </th>
                    @if (authService.isAdmin()) {
                      <th
                        class="text-right px-6 py-4 text-xs font-semibold text-surface-400 uppercase tracking-wider w-20"
                      >
                        Actions
                      </th>
                    }
                  </tr>
                </thead>
                <tbody>
                  @for (member of members(); track member.id) {
                    <tr
                      class="border-b border-surface-800/30 hover:bg-surface-800/30 transition-colors group"
                    >
                      <td class="px-6 py-4 whitespace-nowrap">
                        <div class="flex items-center gap-3">
                          <div
                            class="w-8 h-8 rounded-full bg-primary-500/15 flex items-center justify-center text-xs font-bold text-primary-400"
                          >
                            {{ getInitials(member) }}
                          </div>
                          <span class="text-sm font-medium text-surface-200">
                            {{ member.user.firstName || 'Invited' }}
                            {{ member.user.lastName || 'User' }}
                            @if (member.userId === authService.user()?.id) {
                              <span
                                class="text-[10px] text-surface-500 ml-1.5 font-normal px-1.5 py-0.5 rounded border border-surface-700 uppercase tracking-tighter"
                                >(You)</span
                              >
                            }
                          </span>
                        </div>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <span class="text-sm text-surface-400 font-mono">{{
                          member.user.email
                        }}</span>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <app-badge [variant]="getRoleVariant(member.role)">
                          {{ member.role }}
                        </app-badge>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <span class="text-sm text-surface-400">{{
                          member.createdAt | date: 'MMM d, y'
                        }}</span>
                      </td>
                      @if (authService.isAdmin()) {
                        <td class="px-6 py-4 text-right whitespace-nowrap">
                          @if (member.userId !== authService.user()?.id) {
                            <button
                              (click)="confirmRevoke(member)"
                              class="p-2 rounded-lg text-surface-500 hover:text-danger-400 hover:bg-danger-500/10 transition-all cursor-pointer opacity-0 group-hover:opacity-100"
                              title="Revoke Access"
                            >
                              <svg
                                class="w-4 h-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                  stroke-width="2"
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          }
                        </td>
                      }
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </app-card>
        </div>
      }
    </div>

    <app-confirm-dialog
      [show]="!!memberToRevoke()"
      title="Revoke Member Access"
      [message]="
        'Are you sure you want to revoke access for ' +
        memberToRevoke()?.user?.email +
        '? They will immediately lose access to this organization.'
      "
      confirmText="Revoke Access"
      variant="danger"
      [loading]="revoking()"
      (confirm)="onRevokeMember()"
      (cancel)="memberToRevoke.set(null)"
    />
  `,
})
export class SettingsComponent implements OnInit {
  private organizationService = inject(OrganizationService);
  readonly authService = inject(AuthService);
  private fb = inject(FormBuilder);
  private toast = inject(ToastService);

  readonly loading = signal(true);
  readonly organization = signal<Organization | null>(null);
  readonly members = signal<Member[]>([]);
  readonly showAddMember = signal(false);
  readonly addingMember = signal(false);
  readonly revoking = signal(false);
  readonly memberToRevoke = signal<Member | null>(null);

  readonly memberForm = this.fb.nonNullable.group({
    firstName: ['', [Validators.required]],
    lastName: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    role: ['STAFF' as Role, Validators.required],
  });

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    forkJoin({
      details: this.organizationService.getDetails(),
      members: this.organizationService.getMembers(),
    }).subscribe({
      next: (data) => {
        this.organization.set(data.details);
        this.members.set(data.members);
        this.loading.set(false);
      },
      error: (err) => {
        this.toast.error('Failed to load settings', err.message);
        this.loading.set(false);
      },
    });
  }

  onAddMember(): void {
    if (this.memberForm.invalid) return;

    this.addingMember.set(true);
    this.organizationService.addMember(this.memberForm.getRawValue()).subscribe({
      next: (res) => {
        if (res.tempPassword) {
          this.toast.success(
            'Member Invited',
            `User invited! Temporary password: ${res.tempPassword} (valid for 5 mins). In a real app, this would be sent via email.`,
          );
          // Also log to console as backup for dev
          console.log(
            `[INVITATION] Invited ${this.memberForm.value.email} with password: ${res.tempPassword}`,
          );
        } else {
          this.toast.success('Member Added', 'The existing user has been added to your team.');
        }
        this.memberForm.reset({
          firstName: '',
          lastName: '',
          email: '',
          role: 'STAFF',
        });
        this.showAddMember.set(false);
        this.addingMember.set(false);
        this.loadData();
      },
      error: (err) => {
        this.toast.error('Failed to add member', err.message);
        this.addingMember.set(false);
      },
    });
  }

  confirmRevoke(member: Member): void {
    this.memberToRevoke.set(member);
  }

  onRevokeMember(): void {
    const member = this.memberToRevoke();
    if (!member) return;

    this.revoking.set(true);
    this.organizationService.revokeMember(member.id).subscribe({
      next: () => {
        this.toast.success('Access Revoked', 'The member has been removed from the organization.');
        this.revoking.set(false);
        this.memberToRevoke.set(null);
        this.loadData();
      },
      error: (err) => {
        this.toast.error('Failed to revoke access', err.message);
        this.revoking.set(false);
      },
    });
  }

  getMemberError(field: string): string {
    const control = this.memberForm.get(field);
    if (!control?.touched || !control.errors) return '';
    if (control.errors['required']) {
      if (field === 'firstName') return 'First name is required';
      if (field === 'lastName') return 'Last name is required';
      return 'Email is required';
    }
    if (control.errors['email']) return 'Enter a valid email address';
    return '';
  }

  getRoleVariant(role: string): any {
    switch (role) {
      case 'ADMIN':
        return 'danger';
      case 'MANAGER':
        return 'warning';
      default:
        return 'primary';
    }
  }

  getInitials(member: Member): string {
    const first = member.user.firstName?.[0] || '';
    const last = member.user.lastName?.[0] || '';
    return (first + last).toUpperCase() || member.user.email[0].toUpperCase();
  }
}
