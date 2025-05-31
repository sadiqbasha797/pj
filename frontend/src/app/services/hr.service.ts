import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HRService {
  private apiUrl = 'http://localhost:4000/api/hr';

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('hr_token');
    if (!token) {
      return new HttpHeaders();
    }
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // Auth routes
  register(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, credentials);
  }

  login(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials);
  }

  // Profile routes
  getProfile(): Observable<any> {
    return this.http.get(`${this.apiUrl}/profile`, { headers: this.getHeaders() });
  }

  updateProfile(profileData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/profile`, profileData, { headers: this.getHeaders() });
  }

  // Employee management routes
  getDevelopers(): Observable<any> {
    return this.http.get(`${this.apiUrl}/developers`, { headers: this.getHeaders() });
  }

  getDigitalMarketers(): Observable<any> {
    return this.http.get(`${this.apiUrl}/digital-marketers`, { headers: this.getHeaders() });
  }

  getContentCreators(): Observable<any> {
    return this.http.get(`${this.apiUrl}/content-creators`, { headers: this.getHeaders() });
  }

  registerDeveloper(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register-developer`, data, { headers: this.getHeaders() });
  }

  registerDigitalMarketer(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register-digital-marketer`, data, { headers: this.getHeaders() });
  }

  registerContentCreator(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register-content-creator`, data, { headers: this.getHeaders() });
  }

  deleteDeveloper(developerId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete-developer/${developerId}`, { headers: this.getHeaders() });
  }

  deleteDigitalMarketer(userId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete-digital-marketer/${userId}`, { headers: this.getHeaders() });
  }

  deleteContentCreator(userId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete-content-creator/${userId}`, { headers: this.getHeaders() });
  }

  // Team request routes
  getPendingTeamRequests(): Observable<any> {
    return this.http.get(`${this.apiUrl}/pending-requests`, { headers: this.getHeaders() });
  }

  handleTeamRequest(requestId: string, status: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/team-request/${requestId}`, { status }, { headers: this.getHeaders() });
  }

  // Payslip routes
  createPayslip(payslipData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/payslip/create`, payslipData, { headers: this.getHeaders() });
  }

  getAllPayslips(): Observable<any> {
    return this.http.get(`${this.apiUrl}/payslips`, { headers: this.getHeaders() });
  }

  getPayslipsByEmployee(employeeId: string, role: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/payslip/employee/${employeeId}/${role}`, { headers: this.getHeaders() });
  }

  updatePayslip(payslipId: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/payslip/${payslipId}`, data, { headers: this.getHeaders() });
  }

  deletePayslip(payslipId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/payslip/${payslipId}`, { headers: this.getHeaders() });
  }

  getPayslipStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/payslip/stats`, { headers: this.getHeaders() });
  }

  // Holiday management routes
  getAllHolidays(): Observable<any> {
    return this.http.get(`${this.apiUrl}/holidays`, { headers: this.getHeaders() });
  }

  approveOrDenyHoliday(holidayId: string, status: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/holiday/${holidayId}`, { status }, { headers: this.getHeaders() });
  }

  // Add these new notification methods
  getNotifications(): Observable<any> {
    return this.http.get(`${this.apiUrl}/notifications`, { headers: this.getHeaders() });
  }

  markNotificationAsRead(notificationId: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/notifications/${notificationId}/read`, {}, { headers: this.getHeaders() });
  }

  markAllNotificationsAsRead(): Observable<any> {
    return this.http.put(`${this.apiUrl}/notifications/read-all`, {}, { headers: this.getHeaders() });
  }
}
