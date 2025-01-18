import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private apiUrl = 'http://localhost:3000/api/client';

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
  updateProfile(clientId: string, clientData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${clientId}`, clientData, { headers: this.getHeaders() });
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
}


