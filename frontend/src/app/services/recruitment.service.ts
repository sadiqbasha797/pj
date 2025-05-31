import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class RecruitmentService {
  private apiUrl = 'http://localhost:4000/api'; // Base API URL

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    const hrToken = localStorage.getItem('hr_token');
    const adminToken = localStorage.getItem('adminToken');
    const token = hrToken || adminToken;

    if (!token) {
      return new HttpHeaders();
    }

    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // Get authorization headers without content-type for multipart form data
  private getAuthHeaders(): HttpHeaders {
    const hrToken = localStorage.getItem('hr_token');
    const adminToken = localStorage.getItem('adminToken');
    const token = hrToken || adminToken;

    if (!token) {
      return new HttpHeaders();
    }

    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  // Candidate APIs
  createCandidate(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/candidates`, formData, { 
      headers: this.getAuthHeaders() // Use auth headers without content-type
    });
  }

  getAllCandidates(): Observable<any> {
    return this.http.get(`${this.apiUrl}/candidates`, { 
      headers: this.getHeaders() 
    });
  }

  getCandidateById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/candidates/${id}`, { 
      headers: this.getHeaders() 
    });
  }

  updateCandidate(id: string, formData: FormData): Observable<any> {
    return this.http.put(`${this.apiUrl}/candidates/${id}`, formData, { 
      headers: this.getAuthHeaders() // Use auth headers without content-type 
    });
  }

  deleteCandidate(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/candidates/${id}`, { 
      headers: this.getHeaders() 
    });
  }

  // Job APIs
  createJob(jobData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/jobs`, jobData, { 
      headers: this.getHeaders() 
    });
  }

  getAllJobs(params?: any): Observable<any> {
    return this.http.get(`${this.apiUrl}/jobs`, { 
      headers: this.getHeaders(),
      params: params // For filtering: status, role, salary range, etc.
    });
  }

  getJobById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/jobs/${id}`, { 
      headers: this.getHeaders() 
    });
  }

  updateJob(id: string, jobData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/jobs/${id}`, jobData, { 
      headers: this.getHeaders() 
    });
  }

  deleteJob(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/jobs/${id}`, { 
      headers: this.getHeaders() 
    });
  }

  // Interview APIs
  scheduleInterview(interviewData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/interviews`, interviewData, { 
      headers: this.getHeaders() 
    });
  }

  getAllInterviews(): Observable<any> {
    return this.http.get(`${this.apiUrl}/interviews`, { 
      headers: this.getHeaders() 
    });
  }

  getInterviewById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/interviews/${id}`, { 
      headers: this.getHeaders() 
    });
  }

  updateInterview(id: string, interviewData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/interviews/${id}`, interviewData, { 
      headers: this.getHeaders() 
    });
  }

  updateInterviewStatus(id: string, statusData: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}/interviews/${id}/status`, statusData, { 
      headers: this.getHeaders() 
    });
  }

  deleteInterview(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/interviews/${id}`, { 
      headers: this.getHeaders() 
    });
  }

  // Offer Letter APIs
  createOfferLetter(offerLetterData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/offer-letters`, offerLetterData, { 
      headers: this.getHeaders() 
    });
  }

  getAllOfferLetters(): Observable<any> {
    return this.http.get(`${this.apiUrl}/offer-letters`, { 
      headers: this.getHeaders() 
    });
  }

  getOfferLetterById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/offer-letters/${id}`, { 
      headers: this.getHeaders() 
    });
  }

  updateOfferLetterStatus(id: string, statusData: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}/offer-letters/${id}/status`, statusData, { 
      headers: this.getHeaders() 
    });
  }

  deleteOfferLetter(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/offer-letters/${id}`, { 
      headers: this.getHeaders() 
    });
  }

  // Additional Recruitment APIs
  getCandidatesByJobId(jobId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/jobs/${jobId}/candidates`, { 
      headers: this.getHeaders() 
    });
  }

  getInterviewsByCandidate(candidateId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/candidates/${candidateId}/interviews`, { 
      headers: this.getHeaders() 
    });
  }

  getCandidateApplicationHistory(candidateId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/candidates/${candidateId}/applications`, { 
      headers: this.getHeaders() 
    });
  }

  // Job Application APIs
  applyToJob(candidateId: string, jobId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/candidates/${candidateId}/apply/${jobId}`, {}, { 
      headers: this.getHeaders() 
    });
  }

  updateApplicationStatus(candidateId: string, jobId: string, status: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/candidates/${candidateId}/application/${jobId}/status`, 
      { status }, 
      { headers: this.getHeaders() }
    );
  }

  // Statistics and Reports
  getRecruitmentStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/recruitment/stats`, { 
      headers: this.getHeaders() 
    });
  }

  getJobStats(jobId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/jobs/${jobId}/stats`, { 
      headers: this.getHeaders() 
    });
  }

  // Search and Filters
  searchCandidates(params: any): Observable<any> {
    return this.http.get(`${this.apiUrl}/candidates/search`, { 
      headers: this.getHeaders(),
      params: params // skills, experience, education, etc.
    });
  }

  filterJobs(params: any): Observable<any> {
    return this.http.get(`${this.apiUrl}/jobs/filter`, { 
      headers: this.getHeaders(),
      params: params // status, salary range, location, etc.
    });
  }

  // Document Management
  uploadCandidateDocument(candidateId: string, formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/candidates/${candidateId}/documents`, formData, { 
      headers: this.getAuthHeaders() 
    });
  }

  getCandidateDocuments(candidateId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/candidates/${candidateId}/documents`, { 
      headers: this.getHeaders() 
    });
  }

  deleteCandidateDocument(candidateId: string, documentId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/candidates/${candidateId}/documents/${documentId}`, { 
      headers: this.getHeaders() 
    });
  }
}
