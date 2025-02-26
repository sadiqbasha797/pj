import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../services/admin.service';

interface TeamRequest {
  _id: string;
  manager: {
    username: string;
    email: string;
  };
  memberId: {
    username: string;
    role?: string;
  };
  requestType: string;
  status: string;
  requestDate: Date;
  notes?: string;
}

@Component({
  selector: 'app-team-requests',
  templateUrl: './team-requests.component.html',
  standalone: true,
  imports: [CommonModule]
})
export class TeamRequestsComponent implements OnInit {
  pendingRequests: TeamRequest[] = [];
  processedCount: number = 0;
  hoveredRequestId: string | null = null;

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.loadPendingRequests();
    // You'll need to add an API endpoint to get the processed count
    this.processedCount = 0; // Placeholder
  }

  loadPendingRequests() {
    this.adminService.getPendingRequests().subscribe({
      next: (response) => {
        this.pendingRequests = response.requests;
      },
      error: (error) => {
        console.error('Error loading pending requests:', error);
      }
    });
  }

  handleRequest(requestId: string, status: string) {
    this.adminService.handleTeamRequest(requestId, status).subscribe({
      next: (response) => {
        console.log(`Request ${status} successfully:`, response);
        this.loadPendingRequests();
        if (status === 'approved' || status === 'rejected') {
          this.processedCount++;
        }
      },
      error: (error) => {
        console.error(`Error ${status} request:`, error);
      }
    });
  }

  setHoveredRequest(requestId: string | null) {
    this.hoveredRequestId = requestId;
  }

  isRequestHovered(requestId: string): boolean {
    return this.hoveredRequestId === requestId;
  }
}
