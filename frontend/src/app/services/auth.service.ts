import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { CacheService } from './cache.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'https://projexinovps.projexino.com/api/admin'; // Update this to your actual API URL

  constructor(
    private http: HttpClient,
    private router: Router,
    private cacheService: CacheService
  ) {}

  login(credentials: any): Observable<any> {
    return this.http.post<{ token: string, role?: string, _id?: string }>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        if (response && response.token) {
          localStorage.setItem('adminToken', response.token);
          if (response.role) {
            localStorage.setItem('userRole', response.role);
          }
          if (response._id) {
            localStorage.setItem('userId', response._id);
          }
        }
      })
    );
  }

  getToken(): string | null {
    return localStorage.getItem('adminToken');
  }

  getUserRole(): string | null {
    return localStorage.getItem('userRole');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  logout(): void {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('userRole');
    this.cacheService.clearCache();
    this.router.navigate(['/admin/login']);
  }
}
