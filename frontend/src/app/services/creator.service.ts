import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CreatorService {
  
    private apiUrl = 'http://localhost:4000/api/content-creator';


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

  getParticipatingMeetings(): Observable<any> {
    return this.http.get(`${this.apiUrl}/participating-meetings`, { headers: this.getHeaders() });
  }

  getAllDigitalMarketingMembers(): Observable<any> {
    return this.http.get(`${this.apiUrl}/all-digital-marketing-members`, { headers: this.getHeaders() });
  }

  getAllContentCreatorMembers(): Observable<any> {
    return this.http.get(`${this.apiUrl}/all-content-creator-members`, { headers: this.getHeaders() });
  }

  getAllAdmins(): Observable<any> {
    return this.http.get(`${this.apiUrl}/all-admins`, { headers: this.getHeaders() });
  }
  
  getAllDevelopers(): Observable<any> {
    return this.http.get(`${this.apiUrl}/all-developers`, { headers: this.getHeaders() });
  }
    //client api's
    getAllClients(): Observable<any> {
      return this.http.get(`${this.apiUrl}/clients`, { headers: this.getHeaders() });
    }
  
  getAllManagers(): Observable<any> {
    return this.http.get(`${this.apiUrl}/all-managers`, { headers: this.getHeaders() });
  }
    
  addEvent(event: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/add-event`, event, { headers: this.getHeaders() });
  }

  updateEvent(eventId: string, event: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/update-event/${eventId}`, event, { headers: this.getHeaders() });
  }

  deleteEvent(eventId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete-event/${eventId}`, { headers: this.getHeaders() });
  }

  getContentCreatorEvents(): Observable<any> {
    return this.http.get(`${this.apiUrl}/content-creator-events`, { headers: this.getHeaders() });
  }

  applyForHoliday(holidayData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/apply-for-holiday`, holidayData, { headers: this.getHeaders() });
  }

  withdrawHoliday(holidayId: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/withdraw-holiday/${holidayId}`, {}, { headers: this.getHeaders() });
  }

  fetchHolidays(): Observable<any> {
    return this.http.get(`${this.apiUrl}/fetch-holidays`, { headers: this.getHeaders() });
  }

  // Forgot/Reset Password
  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/forgot-password`, { email });
  }
  resetPassword(data: { email: string; otp: string; newPassword: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset-password`, data);
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
