import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/admin'; // Update this to your actual API URL

  constructor(private http: HttpClient, private router: Router) {}

  login(credentials: any): Observable<any> {
    return this.http.post<{ token: string, role?: string }>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        if (response && response.token) {
          localStorage.setItem('adminToken', response.token);
          if (response.role) {
            localStorage.setItem('userRole', response.role);
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
    this.router.navigate(['/admin/login']);
  }
}
