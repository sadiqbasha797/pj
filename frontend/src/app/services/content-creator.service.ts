import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreatorService } from './creator.service';

@Injectable({
  providedIn: 'root'
})
export class ContentCreatorService {
  private apiUrl = 'http://localhost:4000/api/content-creator';

  constructor(
    private http: HttpClient,
    private creatorService: CreatorService
  ) { }

  private getHeaders(): HttpHeaders {
    const token = this.creatorService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  getProfile(): Observable<any> {
    return this.http.get(`${this.apiUrl}/profile`, { headers: this.getHeaders() });
  }

  fetchManagers(): Observable<any> {
    return this.http.get(`${this.apiUrl}/all-managers`, { headers: this.getHeaders() });
  }

  fetchDevelopers(): Observable<any> {
    return this.http.get(`${this.apiUrl}/all-developers`, { headers: this.getHeaders() });
  }

  fetchDigitalMarketingMembers(): Observable<any> {
    return this.http.get(`${this.apiUrl}/all-digital-marketing-members`, { headers: this.getHeaders() });
  }

  fetchContentCreatorMembers(): Observable<any> {
    return this.http.get(`${this.apiUrl}/all-content-creator-members`, { headers: this.getHeaders() });
  }

  getAllAdmins(): Observable<any> {
    return this.http.get(`${this.apiUrl}/all-admins`, { headers: this.getHeaders() });
  }

  fetchClients(): Observable<any> {
    return this.http.get(`${this.apiUrl}/clients`, { headers: this.getHeaders() });
  }
}
