import { Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AuthResponse,
  LoginRequest,
  SignupRequest,
  User,
  Organization,
  Role,
  JwtPayload,
} from '../models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = `${environment.apiUrl}/auth`;

  // Signals for reactive state
  private readonly _user = signal<User | null>(null);
  private readonly _organization = signal<Organization | null>(null);
  private readonly _token = signal<string | null>(null);
  private readonly _role = signal<Role | null>(null);

  // Public computed signals
  readonly user = this._user.asReadonly();
  readonly organization = this._organization.asReadonly();
  readonly token = this._token.asReadonly();
  readonly role = this._role.asReadonly();
  readonly isAuthenticated = computed(() => !!this._token());
  readonly isAdmin = computed(() => this._role() === 'ADMIN');
  readonly isManager = computed(() => this._role() === 'MANAGER' || this._role() === 'ADMIN');
  readonly userDisplayName = computed(() => {
    const u = this._user();
    if (!u) return '';
    return [u.firstName, u.lastName].filter(Boolean).join(' ') || u.email;
  });
  readonly userInitials = computed(() => {
    const u = this._user();
    if (!u) return '?';
    const first = u.firstName?.[0] || '';
    const last = u.lastName?.[0] || '';
    return (first + last).toUpperCase() || u.email[0].toUpperCase();
  });

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {
    this.loadFromStorage();
  }

  login(data: LoginRequest): Observable<AuthResponse> {
    console.log('Attempting login for:', data.email);
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, data).pipe(
      tap((res) => {
        console.log('Login successful');
        this.handleAuthSuccess(res);
      }),
      catchError((err) => {
        console.error('Login error:', err);
        return throwError(() => new Error(err.error?.error || 'Login failed'));
      }),
    );
  }

  signup(data: SignupRequest): Observable<AuthResponse> {
    console.log('Attempting signup for:', data.email);
    return this.http.post<AuthResponse>(`${this.apiUrl}/signup`, data).pipe(
      tap((res) => {
        console.log('Signup successful');
        this.handleAuthSuccess(res);
      }),
      catchError((err) => {
        console.error('Signup error:', err);
        return throwError(() => new Error(err.error?.error || 'Signup failed'));
      }),
    );
  }

  logout(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_org');
    this._token.set(null);
    this._user.set(null);
    this._organization.set(null);
    this._role.set(null);
    this.router.navigate(['/auth/login']);
  }

  getToken(): string | null {
    return this._token();
  }

  private handleAuthSuccess(res: AuthResponse): void {
    this._token.set(res.token);
    this._user.set(res.user);
    this._organization.set(res.organization);

    // Decode role from JWT
    const payload = this.decodeToken(res.token);
    if (payload) {
      this._role.set(payload.role);
    }

    localStorage.setItem('auth_token', res.token);
    localStorage.setItem('auth_user', JSON.stringify(res.user));
    localStorage.setItem('auth_org', JSON.stringify(res.organization));
  }

  private loadFromStorage(): void {
    const token = localStorage.getItem('auth_token');
    const userStr = localStorage.getItem('auth_user');
    const orgStr = localStorage.getItem('auth_org');

    if (token && userStr && orgStr) {
      const payload = this.decodeToken(token);
      if (payload && payload.exp * 1000 > Date.now()) {
        this._token.set(token);
        this._user.set(JSON.parse(userStr));
        this._organization.set(JSON.parse(orgStr));
        this._role.set(payload.role);
      } else {
        // Token expired — clear
        this.logout();
      }
    }
  }

  private decodeToken(token: string): JwtPayload | null {
    try {
      const payload = token.split('.')[1];
      const decoded = atob(payload);
      return JSON.parse(decoded);
    } catch {
      return null;
    }
  }
}
