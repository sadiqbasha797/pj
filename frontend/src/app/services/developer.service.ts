import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DeveloperService {
  private apiUrl = 'http://localhost:3000/api/developer'; // Adjust this URL as needed

  constructor(private http: HttpClient) { }

  // User management
  login(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials);
  }

  getProfile(): Observable<any> {
    return this.http.get(`${this.apiUrl}/profile`);
  }

  updateProfile(profileData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/profile`, profileData);
  }

  // Project management
  getAssignedProjects(): Observable<any> {
    return this.http.get(`${this.apiUrl}/projects`);
  }

  updateProjectStatus(projectId: string, status: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/project-status/${projectId}`, { status });
  }

  // Calendar events
  addEvent(eventData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/events`, eventData);
  }

  updateEvent(eventId: string, eventData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/events/${eventId}`, eventData);
  }

  deleteEvent(eventId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/events/${eventId}`);
  }

  getAllEvents(): Observable<any> {
    return this.http.get(`${this.apiUrl}/events`);
  }

  getUserEvents(): Observable<any> {
    return this.http.get(`${this.apiUrl}/user-events`);
  }

  // Holiday management
  applyForHoliday(holidayData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/holidays`, holidayData);
  }

  fetchHolidays(): Observable<any> {
    return this.http.get(`${this.apiUrl}/holidays`);
  }

  withdrawHoliday(holidayId: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/holidays/withdraw/${holidayId}`, {});
  }
}

