import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ManagerService } from '../../services/manager.service';

interface TeamRequest {
  _id: string;
  requestType: 'developer' | 'digitalMarketer' | 'contentCreator';
  status: 'pending' | 'approved' | 'rejected';
  requestDate: string;
  responseDate?: string;
  notes?: string;
  memberId: {
    username: string;
    email: string;
    skills?: string[];
    role?: string;
  };
}

interface TeamMember {
  _id: string;
  username: string;
  email: string;
  role: string;
}

@Component({
  selector: 'app-team-request-manager',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './team-request-manager.component.html',
  styleUrl: './team-request-manager.component.css'
})
export class TeamRequestManagerComponent implements OnInit {
  requests: TeamRequest[] = [];
  loading = true;
  error = '';
  requestForm: FormGroup;
  developers: TeamMember[] = [];
  marketingMembers: TeamMember[] = [];
  contentCreators: TeamMember[] = [];
  showRequestForm = false;
  hoveredRequestId: string | null = null;

  constructor(
    private managerService: ManagerService,
    private fb: FormBuilder
  ) {
    this.requestForm = this.fb.group({
      requestType: ['', Validators.required],
      memberId: ['', Validators.required],
      notes: ['']
    });
  }

  ngOnInit() {
    this.loadRequests();
    this.loadTeamMembers();
  }

  private loadRequests() {
    this.managerService.getManagerRequests().subscribe({
      next: (response) => {
        this.requests = response.requests;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load requests. Please try again later.';
        this.loading = false;
        console.error('Error loading requests:', error);
      }
    });
  }

  private loadTeamMembers() {
    this.managerService.getAllDevelopersUnfiltered().subscribe({
      next: (response) => {
        this.developers = response.data.map(dev => ({
          _id: dev._id,
          username: dev.username,
          email: dev.email,
          role: dev.role
        }));
      },
      error: (error) => console.error('Error loading developers:', error)
    });

    this.managerService.getAllDigitalMarketingMembers().subscribe({
      next: (response) => {
        this.marketingMembers = response.data;
      },
      error: (error) => console.error('Error loading marketing members:', error)
    });

    this.managerService.getAllContentCreatorMembers().subscribe({
      next: (response) => {
        this.contentCreators = response.data;
      },
      error: (error) => console.error('Error loading content creators:', error)
    });
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'approved':
        return 'text-green-600 bg-green-100';
      case 'rejected':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-yellow-600 bg-yellow-100';
    }
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  submitRequest() {
    if (this.requestForm.valid) {
      this.loading = true;
      this.managerService.createTeamRequest(this.requestForm.value).subscribe({
        next: (response) => {
          this.loading = false;
          this.showRequestForm = false;
          this.requestForm.reset();
          this.loadRequests();
        },
        error: (error) => {
          this.loading = false;
          this.error = 'Failed to submit request. Please try again.';
          console.error('Error submitting request:', error);
        }
      });
    }
  }

  getAvailableMembers() {
    switch (this.requestForm.get('requestType')?.value) {
      case 'developer':
        return this.developers;
      case 'digitalMarketer':
        return this.marketingMembers;
      case 'contentCreator':
        return this.contentCreators;
      default:
        return [];
    }
  }

  setHoveredRequest(requestId: string | null) {
    this.hoveredRequestId = requestId;
  }
}
