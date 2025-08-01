import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class MarketerService {
  [x: string]: any;
    private apiUrl = 'http://localhost:4000/api/digital-marketing'; // Base API URL


  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('marketerToken');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  // Auth endpoints
  register(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, formData);
  }

  login(credentials: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        if (response.success && response.data) {
          localStorage.setItem('marketerToken', response.data.token);
          localStorage.setItem('userId', response.data.user._id);
          localStorage.setItem('userRole', response.data.user.role);
          // For debugging
          console.log('Stored user data:', {
            userId: response.data.user._id,
            userRole: response.data.user.role
          });
        }
      })
    );
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

  getParticipatingMeetings(): Observable<any> {
    return this.http.get(`${this.apiUrl}/participating-meetings`, { headers: this.getHeaders() });
  }

  // Marketing Events
  getMarketingEvents(): Observable<any> {
    return this.http.get(`${this.apiUrl}/marketing-events`, { headers: this.getHeaders() });
  }

  // Get all members
  getAllMarketingMembers(): Observable<any> {
    return this.http.get(`${this.apiUrl}/digital-marketing-members`, { headers: this.getHeaders() });
  }

  getAllContentCreators(): Observable<any> {
    return this.http.get(`${this.apiUrl}/content-creator-members`, { headers: this.getHeaders() });
  }

  getAllDevelopers(): Observable<any> {
    return this.http.get(`${this.apiUrl}/developers`, { headers: this.getHeaders() });
  }

  getAllManagers(): Observable<any> {
    return this.http.get(`${this.apiUrl}/managers`, { headers: this.getHeaders() });
  }

  getAllAdmins(): Observable<any> {
    return this.http.get(`${this.apiUrl}/admins`, { headers: this.getHeaders() });
  }
  
  //client api's
  getAllClients(): Observable<any> {
    return this.http.get(`${this.apiUrl}/clients`, { headers: this.getHeaders() });
  }

  // Calendar API's
  addEvent(eventData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/add-event`, eventData, { headers: this.getHeaders() });
  }

  updateEvent(eventId: string, eventData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/update-event/${eventId}`, eventData, { headers: this.getHeaders() });
  }

  deleteEvent(eventId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete-event/${eventId}`, { headers: this.getHeaders() });
  }

  // Holiday API's
  applyForHoliday(holidayData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/apply-for-holiday`, holidayData, { headers: this.getHeaders() });
  }

  withdrawHoliday(holidayId: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/withdraw-holiday/${holidayId}`, {}, { headers: this.getHeaders() });
  }

  fetchHolidays(): Observable<any> {
    return this.http.get(`${this.apiUrl}/fetch-holidays`, { headers: this.getHeaders() });
  }

  // Marketing Task APIs
  createMarketingTask(taskData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/create-marketing-task`, taskData, { headers: this.getHeaders() });
  }

  getAllMarketingTasks(): Observable<any> {
    return this.http.get(`${this.apiUrl}/get-all-marketing-tasks`, { headers: this.getHeaders() });
  }

  getMarketingTaskById(taskId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/get-marketing-task-by-id/${taskId}`, { headers: this.getHeaders() });
  }

  updateMarketingTask(taskId: string, taskData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/update-marketing-task/${taskId}`, taskData, { headers: this.getHeaders() });
  }

  deleteMarketingTask(taskId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete-marketing-task/${taskId}`, { headers: this.getHeaders() });
  }
  fetchProjects(): Observable<any> {
    return this.http.get(`${this.apiUrl}/projects`, { headers: this.getHeaders() });
  }

  // Forgot/Reset Password
  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/forgot-password`, { email });
  }
  resetPassword(data: { email: string; otp: string; newPassword: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset-password`, data);
  }
}