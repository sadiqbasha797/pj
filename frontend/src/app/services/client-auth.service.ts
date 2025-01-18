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
  private apiUrl = 'http://localhost:3000/api/client';

  constructor(
    private http: HttpClient,
    private router: Router,
    private cacheService: CacheService
  ) {}

  login(credentials: any): Observable<any> {
    return this.http.post<{ token: string, email: string }>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        if (response && response.token) {
          localStorage.setItem('clientToken', response.token);
          localStorage.setItem('userRole', 'client');
          if (response.email) {
            localStorage.setItem('email', response.email);
          }
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

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  logout(): void {
    localStorage.removeItem('clientToken');
    localStorage.removeItem('userRole');
    this.cacheService.clearCache();
    this.router.navigate(['/client/login']);
  }
} 