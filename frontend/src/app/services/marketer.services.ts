import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class MarketerService {
  [x: string]: any;
  private apiUrl = 'http://localhost:3000/api/digital-marketing'; // Base API URL

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('marketerToken');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  // Auth endpoints
  register(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, formData);
  }

  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials);
  }

  // Profile management
  getProfile(): Observable<any> {
    return this.http.get(`${this.apiUrl}/profile`, { headers: this.getHeaders() });
  }

  updateProfile(formData: FormData): Observable<any> {
    return this.http.put(`${this.apiUrl}/profile`, formData, { headers: this.getHeaders() });
  }

  deleteProfile(): Observable<any> {
    return this.http.delete(`${this.apiUrl}/profile`, { headers: this.getHeaders() });
  }

  // Task Updates
  createTaskUpdate(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/task-updates`, formData, { headers: this.getHeaders() });
  }

  getTaskUpdates(taskId: string): Observable<any> {
    console.log('Fetching updates for task:', taskId); // Debug log
    return this.http.get(`${this.apiUrl}/task-updates/${taskId}`, { 
      headers: this.getHeaders() 
    })
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

  // Revenue management
  createRevenue(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/revenue`, formData, { headers: this.getHeaders() });
  }

  getAllRevenue(): Observable<any> {
    console.log('Calling revenue endpoint:', `${this.apiUrl}/revenue`);
    console.log('Headers:', this.getHeaders());
    return this.http.get(`${this.apiUrl}/revenue`, { headers: this.getHeaders() })
      .pipe(
        tap(
          response => console.log('Revenue response:', response),
          error => console.error('Revenue error:', error)
        )
      );
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

  getAssignedMarketingTasks(): Observable<any> {
    return this.http.get(`${this.apiUrl}/assigned-tasks`, { headers: this.getHeaders() });
  }

  getProjectTaskUpdates(projectId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/project-task-updates/${projectId}`, { headers: this.getHeaders() });
  }

  //project api's
  getProjects(): Observable<any> {
    return this.http.get(`${this.apiUrl}/projects`, { headers: this.getHeaders() });
  }

  // Notifications API's
  fetchNotifications(): Observable<any> {
    return this.http.get(`${this.apiUrl}/notifications`, { headers: this.getHeaders() });
  }

  markAllNotificationsAsRead(): Observable<any> {
    return this.http.put(`${this.apiUrl}/notifications/mark-all-as-read`, {}, { headers: this.getHeaders() });
  }

}


