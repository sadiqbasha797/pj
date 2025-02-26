import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private apiUrl = 'http://localhost:4000/api/client';

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('clientToken');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  // Auth endpoints
  register(clientData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, clientData);
  }

  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials);
  }

  // Protected endpoints
  updateProfile(clientId: string, formData: FormData): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/${clientId}`, 
      formData,
      { 
        headers: new HttpHeaders({
          'Authorization': `Bearer ${localStorage.getItem('clientToken')}`
        })
      }
    );
  }

  deleteProfile(clientId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${clientId}`, { headers: this.getHeaders() });
  }

  getProjects(): Observable<any> {
    return this.http.get(`${this.apiUrl}/projects`, { headers: this.getHeaders() });
  }

  getMeetings(): Observable<any> {
    return this.http.get(`${this.apiUrl}/meetings`, { headers: this.getHeaders() });
  }

  // Calendar endpoints
  addEvent(eventData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/calendar/event`, eventData, { headers: this.getHeaders() });
  }

  updateEvent(eventId: string, eventData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/calendar/event/${eventId}`, eventData, { headers: this.getHeaders() });
  }

  deleteEvent(eventId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/calendar/event/${eventId}`, { headers: this.getHeaders() });
  }

  // Meeting endpoints (using calendar event APIs)
  createMeeting(meetingData: any): Observable<any> {
    const eventData = {
      ...meetingData,
      eventType: 'Meeting',
      isAllDay: false
    };
    return this.http.post(`${this.apiUrl}/calendar/event`, eventData, { headers: this.getHeaders() });
  }

  updateMeeting(meetingId: string, meetingData: any): Observable<any> {
    const eventData = {
      ...meetingData,
      eventType: 'Meeting',
      isAllDay: false
    };
    return this.http.put(`${this.apiUrl}/calendar/event/${meetingId}`, eventData, { headers: this.getHeaders() });
  }

  deleteMeeting(meetingId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/calendar/event/${meetingId}`, { headers: this.getHeaders() });
  }

  // Additional APIs
  getAllAdmins(): Observable<any> {
    return this.http.get(`${this.apiUrl}/admins`, { headers: this.getHeaders() });
  }

  getAllManagers(): Observable<any> {
    return this.http.get(`${this.apiUrl}/managers`, { headers: this.getHeaders() });
  }

  getAllDevelopers(): Observable<any> {
    return this.http.get(`${this.apiUrl}/developers`, { headers: this.getHeaders() });
  }

  getAllMembers(): Observable<any> {
    return this.http.get(`${this.apiUrl}/digital-marketing`, { headers: this.getHeaders() });
  }

  getAllContentCreatorMembers(): Observable<any> {
    return this.http.get(`${this.apiUrl}/content-creators`, { headers: this.getHeaders() });
  }

  addComment(updateId: string, commentData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/comment/${updateId}`, commentData, { headers: this.getHeaders() });
  }

  deleteComment(updateId: string, commentId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/comment/${updateId}/${commentId}`, { headers: this.getHeaders() });
  }

  // Notification APIs
  fetchNotifications(): Observable<any> {
    return this.http.get(`${this.apiUrl}/notifications`, { headers: this.getHeaders() });
  }

  markAllNotificationsAsRead(): Observable<any> {
    return this.http.put(`${this.apiUrl}/notifications/mark-all-as-read`, {}, { headers: this.getHeaders() });
  }

  // Profile API
  getProfile(): Observable<any> {
    return this.http.get(`${this.apiUrl}/profile`, { headers: this.getHeaders() });
  }
}
