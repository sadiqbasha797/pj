import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { CacheService } from './cache.service';

@Injectable({
  providedIn: 'root'
})
export class ClientAuthService {
  private apiUrl = 'http://localhost:4000/api/client';

  constructor(
    private http: HttpClient,
    private router: Router,
    private cacheService: CacheService
  ) {}

  login(credentials: any): Observable<any> {
    return this.http.post<{ token: string, email: string, userId: string }>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        if (response) {
          if (response.token) {
            localStorage.setItem('clientToken', response.token);
          }
          if (response.email) {
            localStorage.setItem('email', response.email);
          }
          if (response.userId) {
            localStorage.setItem('userId', response.userId);
          }
          localStorage.setItem('userRole', 'client');
        }
      })
    );
  }

  getToken(): string | null {
    return localStorage.getItem('clientToken');
  }

  getUserRole(): string | null {
    return localStorage.getItem('userRole');
  }

  getUserId(): string | null {
    return localStorage.getItem('userId');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  logout(): void {
    localStorage.removeItem('clientToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('email');
    localStorage.removeItem('userId');
    this.cacheService.clearCache();
    this.router.navigate(['/client/login']);
  }
} 