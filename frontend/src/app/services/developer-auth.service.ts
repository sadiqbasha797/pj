import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { CacheService } from './cache.service';

@Injectable({
  providedIn: 'root'
})
export class DeveloperAuthService {
  private apiUrl = 'http://localhost:3000/api/developer';

  constructor(
    private http: HttpClient,
    private router: Router,
    private cacheService: CacheService
  ) {}

  login(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap((response: any) => {
          if (response.token) {
            localStorage.setItem('developerToken', response.token);
          }
        })
      );
  }

  getToken(): string | null {
    return localStorage.getItem('developerToken');
  }

  logout(): void {
    localStorage.removeItem('developerToken');
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    return !!token;
  }

  getCurrentUserId(): string | null {
    const token = this.getToken();
    if (!token) return null;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.id || null;
    } catch (e) {
      console.error('Error decoding token:', e);
      return null;
    }
  }
} 