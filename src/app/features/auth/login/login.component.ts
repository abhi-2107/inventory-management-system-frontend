import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputComponent } from '../../../shared/ui/input/input.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { AuthService } from '../../../core/auth/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-login',
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

      <div class="mb-10">
        <h1 class="text-3xl font-bold text-white mb-2 tracking-tight">Welcome back</h1>
        <p class="text-surface-400">Please enter your details to sign in to your account.</p>
      </div>

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-6">
        <div class="space-y-5">
          <app-input
            label="Email Address"
            type="email"
            inputId="login-email"
            placeholder="name@company.com"
            formControlName="email"
            [required]="true"
            [error]="getError('email')"
          />

          <app-input
            label="Password"
            type="password"
            inputId="login-password"
            placeholder="••••••••"
            formControlName="password"
            [required]="true"
            [error]="getError('password')"
          />
        </div>

        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <input type="checkbox" id="remember" class="w-4 h-4 rounded border-surface-700 bg-surface-800 text-primary-600 focus:ring-primary-500/20 transition-colors">
            <label for="remember" class="text-sm text-surface-400 cursor-pointer select-none">Remember for 30 days</label>
          </div>
          <a href="javascript:void(0)" class="text-sm font-medium text-primary-400 hover:text-primary-300 transition-colors">Forgot password?</a>
        </div>

        <app-button type="submit" [loading]="loading()" [disabled]="form.invalid" variant="primary" size="lg" class="w-full">
          <span class="w-full text-center font-bold tracking-wide">Sign In</span>
        </app-button>
      </form>

      <div class="mt-8 pt-8 border-t border-surface-800/50 text-center">
        <p class="text-sm text-surface-400">
          Don't have an account?
          <a routerLink="/auth/signup" class="text-primary-400 hover:text-primary-300 font-bold transition-colors ml-1">
            Create an account
          </a>
        </p>
      </div>
    </div>
  `,
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastService);

  loading = signal(false);

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  onSubmit(): void {
    if (this.form.invalid) return;

    this.loading.set(true);
    this.authService.login(this.form.getRawValue()).subscribe({
      next: () => {
        this.toast.success('Welcome back!', 'You have successfully logged in.');
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading.set(false);
        this.toast.error('Login Failed', err.message);
      },
    });
  }

  getError(field: string): string {
    const control = this.form.get(field);
    if (!control?.touched || !control.errors) return '';
    if (control.errors['required']) return `${field === 'email' ? 'Email' : 'Password'} is required`;
    if (control.errors['email']) return 'Enter a valid email address';
    return '';
  }
}
