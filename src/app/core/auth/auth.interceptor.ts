import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { ToastService } from '../services/toast.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const toastService = inject(ToastService);
  const token = authService.getToken();

  let authReq = req;
  if (token) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        authService.logout();
        toastService.error('Session Expired', 'Please log in again.');
      } else if (error.status === 403) {
        toastService.error('Access Denied', 'You do not have permission to perform this action.');
      } else if (error.status === 0) {
        toastService.error('Network Error', 'Unable to reach the server. Please check your connection.');
      }
      return throwError(() => error);
    }),
  );
};
