import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HRService } from '../../services/hr.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

interface TeamRequest {
  _id: string;
  manager: {
    _id: string;
    username: string;
    email: string;
  };
  memberId: {
    _id: string;
    username: string;
    email: string;
    skills: string[];
    role: string;
  };
  requestType: string;
  memberModel: string;
  status: string;
  requestDate: Date;
  notes: string;
}

@Component({
  selector: 'app-team-requests-hr',
  standalone: true,
  imports: [CommonModule, MatSnackBarModule],
  templateUrl: './team-requests-hr.component.html',
  styleUrls: ['./team-requests-hr.component.css']
})
export class TeamRequestsHrComponent implements OnInit {
  pendingRequests: TeamRequest[] = [];
  processedCount: number = 0;
  hoveredRequestId: string | null = null;

  constructor(
    private hrService: HRService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadPendingRequests();
  }

  loadPendingRequests() {
    this.hrService.getPendingTeamRequests().subscribe({
      next: (response) => {
        this.pendingRequests = response.requests;
      },
      error: (error) => {
        this.showMessage('Error loading pending requests');
      }
    });
  }

  handleRequest(requestId: string, status: string) {
    this.hrService.handleTeamRequest(requestId, status).subscribe({
      next: () => {
        this.showMessage(`Request ${status} successfully`);
        this.loadPendingRequests();
        if (status === 'approved' || status === 'rejected') {
          this.processedCount++;
        }
      },
      error: (error) => {
        this.showMessage(`Error ${status} request`);
      }
    });
  }

  setHoveredRequest(requestId: string | null) {
    this.hoveredRequestId = requestId;
  }

  isRequestHovered(requestId: string): boolean {
    return this.hoveredRequestId === requestId;
  }

  private showMessage(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }
}
