import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

interface ManagerProfile {
  _id: string;
  username: string;
  email: string;
  password: string;
  teamSize: number;
  role: string;
  developers: {
    developerId: string;
    developerName: string;
    assignedOn: string;
    _id: string;
  }[];
  digitalMarketingRoles: {
    roleId: string;
    roleName: string;
    marketerName: string;
    assignedOn: string;
    _id: string;
  }[];
  contentCreators: {
    roleId: string;
    roleName: string;
    creatorName: string;
    assignedOn: string;
    _id: string;
  }[];
  createdAt: string;
}

interface TeamMember {
  _id: string;
  username: string;
  email: string;
  skills: string[];
  role: string;
  image: string | null;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class ManagerService {
  getAllManagerEvents() {
    throw new Error('Method not implemented.');
  }

  getManagerProfile(): Observable<ManagerProfile> {
    const headers = this.getHeaders();
    return this.http.get<ManagerProfile>(`${this.apiUrl}/profile`, { headers });
  }
  private apiUrl = 'http://localhost:4000/api/manager';

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

  updateProject(projectId: string, formData: FormData): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('managerToken')}`);
    
    return this.http.put(
      `${this.apiUrl}/project/${projectId}`, 
      formData,
      { headers }
    ).pipe(
      tap(response => console.log('Update response:', response)),
      catchError(error => {
        console.error('Error in updateProject:', error);
        return throwError(() => error);
      })
    );
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

  // Holiday management
  getAllHolidays(): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get(`${this.apiUrl}/holidays`, { headers });
  }

  getHolidayById(holidayId: string): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get(`${this.apiUrl}/holiday/${holidayId}`, { headers });
  }

  updateHoliday(holidayId: string, holidayData: any): Observable<any> {
    const headers = this.getHeaders();
    return this.http.put(`${this.apiUrl}/holidays/${holidayId}`, holidayData, { headers });
  }

  deleteHoliday(holidayId: string): Observable<any> {
    const headers = this.getHeaders();
    return this.http.delete(`${this.apiUrl}/holidays/${holidayId}`, { headers });
  }

  getDeveloperHolidays(): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get(`${this.apiUrl}/developer-holidays`, { headers });
  }

  approveOrDenyHoliday(holidayId: string, status: string): Observable<any> {
    const headers = this.getHeaders();
    return this.http.put(`${this.apiUrl}/holidays/${holidayId}`, { status }, { headers });
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

  getAllManagers(): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get(`${this.apiUrl}/managers`, { headers });
  }

  getAllAdmins(): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get(`${this.apiUrl}/admins`, { headers });
  }

  getEventCounts(): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get(`${this.apiUrl}/events/counts`, { headers });
  }

  // Notifications
  getNotifications(): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get(`${this.apiUrl}/notifications`, { headers });
  }

  markNotificationAsRead(notificationId: string): Observable<any> {
    const headers = this.getHeaders();
    return this.http.put(`${this.apiUrl}/notifications/${notificationId}/read`, {}, { headers });
  }  

  markAllNotificationsAsRead(): Observable<any> {
    const headers = this.getHeaders();
    return this.http.put(`${this.apiUrl}/notifications/read`, {}, { headers });
  }

  getDeveloperById(developerId: string): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get(`${this.apiUrl}/developer/${developerId}`, { headers });
  }

  // Marketing Task Routes
  createMarketingTask(taskData: FormData): Observable<any> {
    const headers = this.getHeaders();
    return this.http.post(`${this.apiUrl}/marketing-task`, taskData, { headers });
  }

  updateMarketingTask(taskId: string, taskData: FormData): Observable<any> {
    const headers = this.getHeaders();
    return this.http.put(`${this.apiUrl}/marketing-task/${taskId}`, taskData, { headers });
  }

  getAllMarketingTasks(): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get(`${this.apiUrl}/marketing-tasks`, { headers });
  }

  getMarketingTaskById(taskId: string): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get(`${this.apiUrl}/marketing-task/${taskId}`, { headers });
  }

  getMarketingTasksByProject(projectId: string): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get(`${this.apiUrl}/project/${projectId}/marketing-tasks`, { headers });
  }

  deleteMarketingTask(taskId: string): Observable<any> {
    const headers = this.getHeaders();
    return this.http.delete(`${this.apiUrl}/marketing-task/${taskId}`, { headers });
  }

  updateLeadsCount(taskId: string, data: any): Observable<any> {
    const headers = this.getHeaders();
    return this.http.put(`${this.apiUrl}/marketing-task/${taskId}/leads`, data, { headers });
  }

  // Comments
  addComment(updateId: string, commentData: any): Observable<any> {
    const headers = this.getHeaders();
    return this.http.post(`${this.apiUrl}/comment/${updateId}`, commentData, { headers });
  }

  deleteComment(updateId: string, commentId: string): Observable<any> {
    const headers = this.getHeaders();
    return this.http.delete(`${this.apiUrl}/comment/${updateId}/${commentId}`, { headers });
  }

  // Revenue
  createRevenue(revenueData: any): Observable<any> {
    const headers = this.getHeaders();
    return this.http.post(`${this.apiUrl}/revenue`, revenueData, { headers });
  }

  deleteRevenue(revenueId: string): Observable<any> {
    const headers = this.getHeaders();
    return this.http.delete(`${this.apiUrl}/revenue/${revenueId}`, { headers });
  }

  updateRevenue(revenueId: string, revenueData: any): Observable<any> {
    const headers = this.getHeaders();
    return this.http.put(`${this.apiUrl}/revenue/${revenueId}`, revenueData, { headers });
  }

  // Digital Marketing
  getAllDigitalMarketingMembers(): Observable<{ success: boolean; data: TeamMember[] }> {
    const headers = this.getHeaders();
    return this.http.get<{ success: boolean; data: TeamMember[] }>(
      `${this.apiUrl}/digital-marketing-members`, 
      { headers }
    );
  }

  // Content Creator
  getAllContentCreatorMembers(): Observable<{ success: boolean; data: TeamMember[] }> {
    const headers = this.getHeaders();
    return this.http.get<{ success: boolean; data: TeamMember[] }>(
      `${this.apiUrl}/content-creator-members`, 
      { headers }
    );
  }

  // Task Updates
  getTaskUpdates(taskId: string): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get(`${this.apiUrl}/task-updates/${taskId}`, { headers });
  }

  getProjectTaskUpdates(projectId: string): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get(`${this.apiUrl}/project-task-updates/${projectId}`, { headers });
  }

  // Team Requests
  createTeamRequest(requestData: any): Observable<any> {
    const headers = this.getHeaders();
    return this.http.post(`${this.apiUrl}/team-request`, requestData, { headers });
  }

  getManagerRequests(): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get(`${this.apiUrl}/team-requests`, { headers });
  }

  getAllDevelopersUnfiltered(): Observable<{ success: boolean; data: TeamMember[] }> {
    const headers = this.getHeaders();
    return this.http.get<{ success: boolean; data: TeamMember[] }>(
      `${this.apiUrl}/developers`,
      { headers }
    ).pipe(
      map(response => ({
        success: true,
        data: Array.isArray(response) ? response : [] // Transform the response to match the expected format
      }))
    );
  }

  // Forgot/Reset Password
  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/forgot-password`, { email });
  }
  resetPassword(data: { email: string; otp: string; newPassword: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset-password`, data);
  }
}
