import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { DeveloperAuthService } from './developer-auth.service';

@Injectable({
  providedIn: 'root'
})
export class DeveloperService {
  private apiUrl = 'http://localhost:3000/api/developer'; // Adjust this URL as needed

  constructor(
    private http: HttpClient,
    private authService: DeveloperAuthService
  ) { }

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    if (!token) {
      return new HttpHeaders();
    }
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // User management
  login(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials);
  }

  getProfile(): Observable<any> {
    return this.http.get(`${this.apiUrl}/profile`, { headers: this.getHeaders() });
  }

  updateProfile(profileData: FormData): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.authService.getToken()}`
    });
    return this.http.put(`${this.apiUrl}/profile`, profileData, { headers });
  }

  // Project management
  getAssignedProjects(): Observable<any> {
    return this.http.get(`${this.apiUrl}/projects`, { headers: this.getHeaders() });
  }

  updateProjectStatus(projectId: string, status: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/project-status/${projectId}`, { status }, { headers: this.getHeaders() });
  }

  // Calendar events
  addEvent(eventData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/events`, eventData, { headers: this.getHeaders() });
  }

  updateEvent(eventId: string, eventData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/events/${eventId}`, eventData, { headers: this.getHeaders() });
  }

  deleteEvent(eventId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/events/${eventId}`, { headers: this.getHeaders() });
  }

  getAllEvents(): Observable<any> {
    return this.http.get(`${this.apiUrl}/events`, { headers: this.getHeaders() });
  }

  getUserEvents(): Observable<any> {
    return this.http.get(`${this.apiUrl}/user-events`, { headers: this.getHeaders() });
  }

  // Holiday management
  applyForHoliday(holidayData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/holidays`, holidayData, { headers: this.getHeaders() });
  }

  fetchHolidays(): Observable<any> {
    return this.http.get(`${this.apiUrl}/holidays`, { headers: this.getHeaders() });
  }

  withdrawHoliday(holidayId: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/holidays/withdraw/${holidayId}`, {}, { headers: this.getHeaders() });
  }

  // Task management
  getAssignedTasks(): Observable<any> {
    return this.http.get(`${this.apiUrl}/tasks`, { headers: this.getHeaders() });
  }

  addTaskUpdate(taskId: string, updateData: FormData): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.authService.getToken()}`
    });
    return this.http.post(`${this.apiUrl}/task/${taskId}/update`, updateData, { headers });
  }

  deleteTaskUpdate(taskId: string, updateId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/task/${taskId}/update/${updateId}`, { headers: this.getHeaders() });
  }

  addFinalResult(taskId: string, resultData: FormData): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.authService.getToken()}`
    });
    return this.http.post(`${this.apiUrl}/task/${taskId}/final-result`, resultData, { headers });
  }

  fetchDeveloperEvents(): Observable<any> {
    return this.http.get(`${this.apiUrl}/developer-events`, { headers: this.getHeaders() });
  }

  fetchDevelopers(): Observable<any> {
    return this.http.get(`${this.apiUrl}/developers`, { headers: this.getHeaders() });
  }

  fetchManagers(): Observable<any> {
    return this.http.get(`${this.apiUrl}/managers`, { headers: this.getHeaders() });
  }

  // Message routes
  sendMessage(messageData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/messages/send`, messageData, { headers: this.getHeaders() });
  }

  getConversation(otherUserId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/messages/conversation/${otherUserId}`, { headers: this.getHeaders() });
  }

  markAsRead(messageId: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/messages/read/${messageId}`, {}, { headers: this.getHeaders() });
  }

  getUnreadCount(): Observable<any> {
    return this.http.get(`${this.apiUrl}/messages/unread`, { headers: this.getHeaders() });
  }

  getAllAdmins(): Observable<any> {
    return this.http.get(`${this.apiUrl}/admins`, { headers: this.getHeaders() });
  }
  
  fetchDeveloperNotifications(): Observable<any> {
    return this.http.get(`${this.apiUrl}/developer-notifications`, { headers: this.getHeaders() });
  }

  markNotificationAsRead(notificationId: string): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/notifications/${notificationId}/read`, 
      {}, 
      { headers: this.getHeaders() }
    ).pipe(
      tap(() => {
        console.log('Notification marked as read:', notificationId);
      }),
      catchError((error) => {
        console.error('Error marking notification as read:', error);
        return throwError(() => error);
      })
    );
  }

  markAllNotificationsAsRead(): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/notifications/mark-all-read`, 
      {}, 
      { headers: this.getHeaders() }
    ).pipe(
      tap(() => {
        console.log('All notifications marked as read');
      }),
      catchError((error) => {
        console.error('Error marking all notifications as read:', error);
        return throwError(() => error);
      })
    );
  }  

}
