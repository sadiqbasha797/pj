import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

interface ManagerProfile {
  _id: string;
  username: string;
  email: string;
  teamSize: number;
  developers: {
    developerId: string;
    developerName: string;
    assignedOn: string;
    _id: string;
  }[];
}

@Injectable({
  providedIn: 'root'
})
export class ManagerService {
  getAllManagerEvents() {
    throw new Error('Method not implemented.');
  }
  getAllManagers() {
    throw new Error('Method not implemented.');
  }
  getManagerProfile(): Observable<ManagerProfile> {
    const headers = this.getHeaders();
    return this.http.get<ManagerProfile>(`${this.apiUrl}/profile`, { headers });
  }
  private apiUrl = 'http://localhost:3000/api/manager';

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('managerToken');
    if (!token) {
      console.warn('No manager token found in localStorage');
    }
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  // User management
  login(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials);
  }

  getProfile(): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get(`${this.apiUrl}/profile`, { headers });
  }

  updateProfile(profileData: any): Observable<any> {
    const headers = this.getHeaders();
    return this.http.put(`${this.apiUrl}/profile`, profileData, { headers });
  }

  registerDeveloper(developerData: any): Observable<any> {
    const headers = this.getHeaders();
    return this.http.post(`${this.apiUrl}/register-dev`, developerData, { headers });
  }

  getAllDevelopers(): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get(`${this.apiUrl}/developers`, { headers });
  }

  getNonVerifiedDevelopers(): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get(`${this.apiUrl}/non-verified`, { headers });
  }

  deleteDeveloper(developerId: string): Observable<any> {
    const headers = this.getHeaders();
    return this.http.delete(`${this.apiUrl}/delete-dev/${developerId}`, { headers });
  }

  verifyDeveloper(developerId: string): Observable<any> {
    const headers = this.getHeaders();
    return this.http.post(`${this.apiUrl}/verify-dev/${developerId}`, {}, { headers });
  }

  // Project management
  addProject(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/project`, formData, { headers: this.getHeaders() });
  }

  getProjects(): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get(`${this.apiUrl}/projects`, { headers });
  }

  updateProject(projectId: string, projectData: any): Observable<any> {
    const headers = this.getHeaders();
    return this.http.put(`${this.apiUrl}/project/${projectId}`, projectData, { headers });
  }

  deleteProject(projectId: string): Observable<any> {
    const headers = this.getHeaders();
    return this.http.delete(`${this.apiUrl}/project/${projectId}`, { headers });
  }

  getProjectsByStatus(status: string): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get(`${this.apiUrl}/projects/status`, { 
      headers,
      params: { status } 
    });
  }

  // Calendar events
  addEvent(eventData: any): Observable<any> {
    const headers = this.getHeaders();
    return this.http.post(`${this.apiUrl}/events`, eventData, { headers });
  }

  updateEvent(eventId: string, eventData: any): Observable<any> {
    const headers = this.getHeaders();
    return this.http.put(`${this.apiUrl}/events/${eventId}`, eventData, { headers });
  }

  deleteEvent(eventId: string): Observable<any> {
    const headers = this.getHeaders();
    return this.http.delete(`${this.apiUrl}/events/${eventId}`, { headers });
  }

  getAllEvents(): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get(`${this.apiUrl}/events`, { headers });
  }

  getUserEvents(): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get(`${this.apiUrl}/user-events`, { headers });
  }

  // Task management
  addTask(taskData: FormData): Observable<any> {
    const headers = this.getHeaders();
    return this.http.post(`${this.apiUrl}/add-task`, taskData, { headers });
  }

  updateTask(taskId: string, taskData: FormData): Observable<any> {
    const headers = this.getHeaders();
    return this.http.put(`${this.apiUrl}/update-task/${taskId}`, taskData, { headers });
  }

  getTasksByProject(projectId: string): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get(`${this.apiUrl}/project-task/${projectId}`, { headers });
  }

  deleteTask(taskId: string): Observable<any> {
    const headers = this.getHeaders();
    return this.http.delete(`${this.apiUrl}/delete-task/${taskId}`, { headers });
  }

  getAllTasks(): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get(`${this.apiUrl}/tasks`, { headers });
  }

  getTaskById(taskId: string): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get(`${this.apiUrl}/task/${taskId}`, { headers });
  }

  addTaskUpdate(taskId: string, updateData: any): Observable<any> {
    const headers = this.getHeaders();
    return this.http.post(`${this.apiUrl}/task/${taskId}/update`, updateData, { headers });
  }

  addFinalResult(taskId: string, resultData: any): Observable<any> {
    const headers = this.getHeaders();
    return this.http.post(`${this.apiUrl}/task/${taskId}/final-result`, resultData, { headers });
  }

  // Add missing calendar-related methods
  getProject(projectId: string): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get(`${this.apiUrl}/project/${projectId}`, { headers });
  }

  getEventCounts(): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get(`${this.apiUrl}/events/counts`, { headers });
  }


}
