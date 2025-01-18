import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = 'http://localhost:3000/api/admin'; // Ensure this matches your backend URL

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('adminToken');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  // User management
  register(adminData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, adminData, { headers: this.getHeaders() });
  }

  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials, { headers: this.getHeaders() });
  }

  getProfile(): Observable<any> {
    return this.http.get(`${this.apiUrl}/profile`, { headers: this.getHeaders() });
  }

  updateProfile(profileData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/profile`, profileData, { headers: this.getHeaders() });
  }

  deleteProfile(): Observable<any> {
    return this.http.delete(`${this.apiUrl}/profile`, { headers: this.getHeaders() });
  }

  // Developer management
  registerDeveloper(developerData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register-dev`, developerData, { headers: this.getHeaders() });
  }

  getAllDevelopers(): Observable<any> {
    return this.http.get(`${this.apiUrl}/developers`, { headers: this.getHeaders() });
  }

  deleteDeveloper(developerId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete-dev/${developerId}`, { headers: this.getHeaders() });
  }

  updateDeveloper(developerId: string, developerData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/update-dev/${developerId}`, developerData, { headers: this.getHeaders() });
  }

  verifyDeveloper(developerId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/developer/verify/${developerId}`, {}, { headers: this.getHeaders() });
  }

  getNonVerifiedDevelopers(): Observable<any> {
    return this.http.get(`${this.apiUrl}/non-verified`, { headers: this.getHeaders() });
  }

  // Manager management
  registerManager(managerData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register-manager`, managerData, { headers: this.getHeaders() });
  }

  getAllManagers(): Observable<any> {
    return this.http.get(`${this.apiUrl}/managers`, { headers: this.getHeaders() });
  }

  deleteManager(managerId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete-manager/${managerId}`, { headers: this.getHeaders() });
  }

  updateManager(managerId: string, managerData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/update-manager/${managerId}`, managerData, { headers: this.getHeaders() });
  }

  // Project management
  addProject(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/project`, formData, { headers: this.getHeaders() });
  }

  getProjects(): Observable<any> {
    return this.http.get(`${this.apiUrl}/projects`, { headers: this.getHeaders() });
  }

  updateProject(projectId: string, formData: FormData): Observable<any> {
    // Remove content-type header to let browser set it with boundary
    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('adminToken')}`);
    
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
    return this.http.delete(`${this.apiUrl}/project/${projectId}`, { headers: this.getHeaders() });
  }

  getProjectsByStatus(status: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/projects/status`, { params: { status }, headers: this.getHeaders() });
  }

  // Calendar events
  getAllEvents(): Observable<any> {
    return this.http.get(`${this.apiUrl}/events`, { headers: this.getHeaders() });
  }

  addEvent(eventData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/events`, eventData, { headers: this.getHeaders() });
  }

  updateEvent(eventId: string, eventData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/events/${eventId}`, eventData, { headers: this.getHeaders() });
  }

  deleteEvent(eventId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/events/${eventId}`, { headers: this.getHeaders() });
  }

  // Holiday management
  approveOrDenyHoliday(holidayId: string, status: 'Approved' | 'Denied'): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/holidays/${holidayId}`,
      { status },
      { headers: this.getHeaders() }
    );
  }

  updateHoliday(holidayId: string, holidayData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/holidays/update/${holidayId}`, holidayData, { headers: this.getHeaders() });
  }

  deleteHoliday(holidayId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/holidays/delete/${holidayId}`, { headers: this.getHeaders() });
  }

  getAllHolidays(): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/holidays`,
      { headers: this.getHeaders() }
    );
  }

  getDeveloperHolidays(developerId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/holidays/developer/${developerId}`, { headers: this.getHeaders() });
  }

  getHolidayById(holidayId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/holidays/${holidayId}`, { headers: this.getHeaders() });
  }

  // Task management
  addTask(taskData: FormData | any): Observable<any> {
    const headers = this.getHeaders();
    return this.http.post(`${this.apiUrl}/add-task`, taskData, { headers });
  }

  updateTask(taskId: string, taskData: FormData | any): Observable<any> {
    const headers = this.getHeaders();
    return this.http.put(`${this.apiUrl}/update-task/${taskId}`, taskData, { headers });
  }

  getAllTasks(): Observable<any> {
    return this.http.get(`${this.apiUrl}/all-tasks`, { headers: this.getHeaders() });
  }

  getTasksByProject(projectId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/project-task/${projectId}`, { headers: this.getHeaders() });
  }

  deleteTask(taskId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete-task/${taskId}`, { headers: this.getHeaders() });
  }

  uploadFile(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/upload`, formData, { headers: this.getHeaders() });
  }

  getAssignedDevelopers(projectId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/project/assigned-developers/${projectId}`, { headers: this.getHeaders() })
      .pipe(
        map((response: any) => {
          return response.developers || [];
        })
      );
  }

  getAllProjects(): Observable<any> {
    return this.http.get(`${this.apiUrl}/projects`, { headers: this.getHeaders() });
  }

  getProject(projectId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/project/${projectId}`, { headers: this.getHeaders() });
  }

  getUserEvents(): Observable<any> {
    return this.http.get(`${this.apiUrl}/user-events`, { headers: this.getHeaders() });
  }

  getTaskById(taskId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/task/${taskId}`, { headers: this.getHeaders() });
  }

  initiatePasswordReset(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/initiate-password-reset`, { email });
  }

  resetPassword(resetData: { token: string; newPassword: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset-password`, resetData);
  }

  updateAdminMedia(formData: FormData): Observable<any> {
    return this.http.put(`${this.apiUrl}/update-media`, formData, { headers: this.getHeaders() });
  }

  // Add new task-related methods
  addTaskUpdate(taskId: string, formData: FormData): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/task/${taskId}/update`,
      formData,
      { headers: this.getHeaders() }
    );
  }

  deleteTaskUpdate(taskId: string, updateId: string): Observable<any> {
    return this.http.delete(
      `${this.apiUrl}/task/${taskId}/update/${updateId}`,
      { headers: this.getHeaders() }
    ).pipe(
      catchError(error => {
        console.error('Error deleting task update:', error);
        return throwError(() => error);
      })
    );
  }

  addFinalResult(taskId: string, formData: FormData): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/task/${taskId}/final-result`,
      formData,
      { headers: this.getHeaders() }
    );
  }

  updateTaskMedia(taskId: string, formData: FormData): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/task/${taskId}/media`,
      formData,
      { headers: this.getHeaders() }
    );
  }

  getAllNotifications(): Observable<any> {
    return this.http.get(`${this.apiUrl}/notifications`, { headers: this.getHeaders() });
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

  //client apis
  getAllClients(): Observable<any> {
    return this.http.get(`${this.apiUrl}/clients`, { headers: this.getHeaders() });
  }    
  registerClient(clientData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register-client`, clientData, { headers: this.getHeaders() });
  }

  deleteClient(clientId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete-client/${clientId}`, { headers: this.getHeaders() });
  }

  updateClient(clientId: string, clientData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/update-client/${clientId}`, clientData, { headers: this.getHeaders() });
  }

  // Marketing Task APIs
  createMarketingTask(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/marketing-task`, formData, { headers: this.getHeaders() });
  }

  updateMarketingTask(taskId: string, formData: FormData): Observable<any> {
    return this.http.put(`${this.apiUrl}/marketing-task/${taskId}`, formData, { headers: this.getHeaders() });
  }

  getAllMarketingTasks(): Observable<any> {
    return this.http.get(`${this.apiUrl}/marketing-tasks`, { headers: this.getHeaders() });
  }

  getMarketingTaskById(taskId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/marketing-task/${taskId}`, { headers: this.getHeaders() });
  }

  getMarketingTasksByProject(projectId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/project/${projectId}/marketing-tasks`, { headers: this.getHeaders() });
  }

  deleteMarketingTask(taskId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/marketing-task/${taskId}`, { headers: this.getHeaders() });
  }

  updateLeadsCount(taskId: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/marketing-task/${taskId}/leads`, data, { headers: this.getHeaders() });
  }

  // Comment APIs
  addComment(updateId: string, commentData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/comment/${updateId}`, commentData, { headers: this.getHeaders() });
  }

  deleteComment(updateId: string, commentId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/comment/${updateId}/${commentId}`, { headers: this.getHeaders() });
  }

  // Revenue APIs
  createRevenue(revenueData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/revenue`, revenueData, { headers: this.getHeaders() });
  }

  deleteRevenue(revenueId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/revenue/${revenueId}`, { headers: this.getHeaders() });
  }

  updateRevenue(revenueId: string, revenueData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/revenue/${revenueId}`, revenueData, { headers: this.getHeaders() });
  }

  getAllDigitalMarketingMembers(): Observable<any> {
    return this.http.get(`${this.apiUrl}/digital-marketing-members`, { headers: this.getHeaders() });
  }

  getAllContentCreatorMembers(): Observable<any> {
    return this.http.get(`${this.apiUrl}/content-creator-members`, { headers: this.getHeaders() });
  }

  getTaskUpdates(taskId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/task-updates/${taskId}`, { headers: this.getHeaders() });
  }

  getRevenueByProject(projectId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/revenue/${projectId}`, { headers: this.getHeaders() });
  }

  getAllRevenue(): Observable<any> {
    return this.http.get(`${this.apiUrl}/revenue`, { headers: this.getHeaders() });
  }

  adminDeleteUser(userId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/digital-marketing-user/${userId}`, { headers: this.getHeaders() });
  }

  registerDigitalMarketingUser(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/digital-marketing-user`, userData, { headers: this.getHeaders() });
  }

  adminDeleteContentCreator(userId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/content-creator/${userId}`, { headers: this.getHeaders() });
  }  

  registerContentCreator(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/content-creator`, userData, { headers: this.getHeaders() });
  }

  getTasksByUserId(userId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/marketing-user-task/${userId}`, { headers: this.getHeaders() });
  }
}
