import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CreatorService {
  private apiUrl = 'http://localhost:3000/api/content-creator';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  register(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, formData);
  }

  login(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap((response: any) => {
          if (response.token) {
            localStorage.setItem('creatorToken', response.token);
            localStorage.setItem('userRole', 'creator');
          }
        })
      );
  }

  getProfile(): Observable<any> {
    return this.http.get(`${this.apiUrl}/profile`, { headers: this.getHeaders() });
  }

  updateProfile(formData: FormData): Observable<any> {
    return this.http.put(`${this.apiUrl}/profile`, formData, { headers: this.getHeaders() });
  }

  deleteProfile(): Observable<any> {
    return this.http.delete(`${this.apiUrl}/profile`, { headers: this.getHeaders() });
  }

  createTaskUpdate(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/task-updates`, formData, { headers: this.getHeaders() });
  }

  getTaskUpdates(taskId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/task-updates/${taskId}`, { 
      headers: this.getHeaders() 
    });
  }

  addComment(taskUpdateId: string, comment: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/task-updates/${taskUpdateId}/comments`, comment, { headers: this.getHeaders() });
  }

  deleteTaskUpdate(taskUpdateId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/task-updates/${taskUpdateId}`, { headers: this.getHeaders() });
  }

  updateTaskUpdate(taskUpdateId: string, formData: FormData): Observable<any> {
    return this.http.put(`${this.apiUrl}/task-updates/${taskUpdateId}`, formData, { headers: this.getHeaders() });
  }

  createRevenue(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/revenue`, formData, { headers: this.getHeaders() });
  }

  getAllRevenue(): Observable<any> {
    return this.http.get(`${this.apiUrl}/revenue`, { headers: this.getHeaders() });
  }

  getRevenueByProject(projectId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/revenue/project/${projectId}`, { headers: this.getHeaders() });
  }

  updateRevenue(revenueId: string, formData: FormData): Observable<any> {
    return this.http.put(`${this.apiUrl}/revenue/${revenueId}`, formData, { headers: this.getHeaders() });
  }

  deleteRevenue(revenueId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/revenue/${revenueId}`, { headers: this.getHeaders() });
  }

  getAssignedTasks(): Observable<any> {
    return this.http.get(`${this.apiUrl}/assigned-tasks`, { headers: this.getHeaders() });
  }

  getProjectTaskUpdates(projectId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/project-task-updates/${projectId}`, { headers: this.getHeaders() });
  }

  getProjects(): Observable<any> {
    return this.http.get(`${this.apiUrl}/projects`, { headers: this.getHeaders() });
  }

  getNotifications(): Observable<any> {
    return this.http.get(`${this.apiUrl}/notifications`, { headers: this.getHeaders() });
  }

  markAllNotificationsAsRead(): Observable<any> {
    return this.http.put(`${this.apiUrl}/notifications/mark-all-as-read`, {}, { headers: this.getHeaders() });
  }

  getToken(): string | null {
    return localStorage.getItem('creatorToken');
  }

  logout(): void {
    localStorage.removeItem('creatorToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    const role = localStorage.getItem('userRole');
    return !!token && role === 'creator';
  }
}
