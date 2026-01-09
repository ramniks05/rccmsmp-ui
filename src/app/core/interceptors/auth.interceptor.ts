import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpErrorResponse, HttpEvent } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, filter, take, switchMap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

/**
 * Auth Interceptor
 * Automatically adds JWT token to requests and handles token refresh
 */
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(private authService: AuthService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Get the token
    const token = this.authService.getToken();

    // Add token to request if available and it's not an auth endpoint
    if (token && !this.isAuthEndpoint(request.url)) {
      request = this.addTokenHeader(request, token);
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        // If error is 401 (Unauthorized), try to refresh token
        if (error.status === 401 && !this.isAuthEndpoint(request.url) && token) {
          return this.handle401Error(request, next);
        }

        return throwError(() => error);
      })
    );
  }

  /**
   * Add JWT token to request header
   */
  private addTokenHeader(request: HttpRequest<any>, token: string): HttpRequest<any> {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  /**
   * Check if the request is to an authentication endpoint (should not add token)
   */
  private isAuthEndpoint(url: string): boolean {
    const authEndpoints = [
      '/auth/citizen/register',
      '/auth/mobile/send-otp',
      '/auth/mobile/verify-otp',
      '/auth/password/login',
      '/auth/verify-registration-otp',
      '/auth/captcha/generate',
      '/auth/captcha/validate',
      '/auth/refresh-token'
    ];

    return authEndpoints.some(endpoint => url.includes(endpoint));
  }

  /**
   * Handle 401 Unauthorized error by refreshing token
   */
  private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      const refreshToken = this.authService.getRefreshToken();

      if (refreshToken) {
        return this.authService.refreshAccessToken().pipe(
          switchMap((newToken: string) => {
            this.isRefreshing = false;
            this.refreshTokenSubject.next(newToken);
            return next.handle(this.addTokenHeader(request, newToken));
          }),
          catchError((err) => {
            this.isRefreshing = false;
            this.refreshTokenSubject.next(null);
            this.authService.logout();
            return throwError(() => err);
          })
        );
      } else {
        // No refresh token, logout user
        this.isRefreshing = false;
        this.authService.logout();
        return throwError(() => new Error('No refresh token available'));
      }
    } else {
      // If refresh is in progress, wait for it to complete
      return this.refreshTokenSubject.pipe(
        filter(token => token !== null),
        take(1),
        switchMap((token) => next.handle(this.addTokenHeader(request, token)))
      );
    }
  }
}

