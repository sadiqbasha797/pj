import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { CacheService } from './cache.service';

@Injectable({
  providedIn: 'root'
})
export class ManagerAuthService {
  private apiUrl = 'http://localhost:4000/api/manager'; // Update with your manager API endpoint

  constructor(
    private http: HttpClient,
    private router: Router,
    private cacheService: CacheService
  ) {}

  login(credentials: any): Observable<any> {
    return this.http.post<{ token: string, manager: any }>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        if (response && response.token) {
          localStorage.setItem('managerToken', response.token);
          localStorage.setItem('userRole', 'manager');
          if (response.manager?._id) {
            localStorage.setItem('userId', response.manager._id);
          }
          if (response.manager?.username) {
            localStorage.setItem('username', response.manager.username);
          }
          if (response.manager?.email) {
            localStorage.setItem('email', response.manager.email);
          }
        }
      })
    );
  }

  getToken(): string | null {
    return localStorage.getItem('managerToken');
  }

  getUserRole(): string | null {
    return localStorage.getItem('userRole');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  logout(): void {
    localStorage.removeItem('managerToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    localStorage.removeItem('email');
    this.cacheService.clearCache();
    this.router.navigate(['/manager/login']);
  }
} 