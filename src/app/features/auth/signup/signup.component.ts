import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputComponent } from '../../../shared/ui/input/input.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { AuthService } from '../../../core/auth/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, InputComponent, ButtonComponent],
  template: `
    <div class="animate-fade-in">
      <!-- Mobile Logo -->
      <div class="flex items-center gap-3 mb-10 lg:hidden">
        <div class="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-primary-600/20">
          <span class="text-xl font-black text-white italic">I</span>
        </div>
        <span class="text-2xl font-black tracking-tighter text-white">INVENTRACK</span>
      </div>

      <div class="mb-8">
        <h1 class="text-3xl font-bold text-white mb-2 tracking-tight">Create an account</h1>
        <p class="text-surface-400">Join 500+ teams managing inventory with absolute confidence.</p>
      </div>

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-5">
        <div class="grid grid-cols-2 gap-4">
          <app-input
            label="First Name"
            inputId="signup-first"
            placeholder="John"
            formControlName="firstName"
            [required]="true"
            [error]="getError('firstName')"
          />
          <app-input
            label="Last Name"
            inputId="signup-last"
            placeholder="Doe"
            formControlName="lastName"
            [required]="true"
            [error]="getError('lastName')"
          />
        </div>

        <app-input
          label="Organization Name"
          inputId="signup-org"
          placeholder="Acme Inc."
          formControlName="orgName"
          [required]="true"
          [error]="getError('orgName')"
        />

        <app-input
          label="Email Address"
          type="email"
          inputId="signup-email"
          placeholder="name@company.com"
          formControlName="email"
          [required]="true"
          [error]="getError('email')"
        />

        <app-input
          label="Password"
          type="password"
          inputId="signup-password"
          placeholder="Minimum 8 characters"
          formControlName="password"
          [required]="true"
          [error]="getError('password')"
          hint="Must be at least 8 characters"
        />

        <div class="flex items-start gap-2 py-2">
          <input type="checkbox" id="terms" class="mt-1 w-4 h-4 rounded border-surface-700 bg-surface-800 text-primary-600 focus:ring-primary-500/20 transition-colors cursor-pointer">
          <label for="terms" class="text-xs text-surface-500 leading-relaxed cursor-pointer select-none">
            By creating an account, you agree to our 
            <a href="javascript:void(0)" class="text-primary-400 hover:underline">Terms of Service</a> and 
            <a href="javascript:void(0)" class="text-primary-400 hover:underline">Privacy Policy</a>.
          </label>
        </div>

        <app-button type="submit" [loading]="loading()" [disabled]="form.invalid" variant="primary" size="lg" class="w-full">
          <span class="w-full text-center font-bold tracking-wide">Create Account</span>
        </app-button>
      </form>

      <div class="mt-8 pt-8 border-t border-surface-800/50 text-center">
        <p class="text-sm text-surface-400">
          Already have an account?
          <a routerLink="/auth/login" class="text-primary-400 hover:text-primary-300 font-bold transition-colors ml-1">
            Sign in
          </a>
        </p>
      </div>
    </div>
  `,
})
export class SignupComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastService);

  loading = signal(false);

  form = this.fb.nonNullable.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    orgName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  onSubmit(): void {
    if (this.form.invalid) return;

    this.loading.set(true);
    this.authService.signup(this.form.getRawValue()).subscribe({
      next: () => {
        this.toast.success('Account Created!', 'Welcome to InvenTrack.');
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading.set(false);
        this.toast.error('Signup Failed', err.message);
      },
    });
  }

  getError(field: string): string {
    const control = this.form.get(field);
    if (!control?.touched || !control.errors) return '';
    if (control.errors['required']) return 'This field is required';
    if (control.errors['email']) return 'Enter a valid email address';
    if (control.errors['minlength']) return `Minimum ${control.errors['minlength'].requiredLength} characters`;
    return '';
  }
}
