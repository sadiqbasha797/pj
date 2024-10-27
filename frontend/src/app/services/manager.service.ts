import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ManagerService {
  private apiUrl = 'http://localhost:3000/api/manager'; // Adjust this URL as needed

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

  registerDeveloper(developerData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register-dev`, developerData);
  }

  getAllDevelopers(): Observable<any> {
    return this.http.get(`${this.apiUrl}/developers`);
  }

  getNonVerifiedDevelopers(): Observable<any> {
    return this.http.get(`${this.apiUrl}/non-verified`);
  }

  deleteDeveloper(developerId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete-dev/${developerId}`);
  }

  verifyDeveloper(developerId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/verify-dev/${developerId}`, {});
  }

  // Project management
  addProject(projectData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/project`, projectData);
  }

  getProjects(): Observable<any> {
    return this.http.get(`${this.apiUrl}/projects`);
  }

  updateProject(projectId: string, projectData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/project/${projectId}`, projectData);
  }

  deleteProject(projectId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/project/${projectId}`);
  }

  getProjectsByStatus(status: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/projects/status`, { params: { status } });
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

  // Task management
  addTask(taskData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/add-task`, taskData);
  }

  updateTask(taskId: string, taskData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/update-task/${taskId}`, taskData);
  }

  getTasksByProject(projectId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/project-task/${projectId}`);
  }

  deleteTask(taskId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete-task/${taskId}`);
  }
}

