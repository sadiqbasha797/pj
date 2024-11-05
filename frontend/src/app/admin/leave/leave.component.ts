import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../services/admin.service';
import { FormsModule } from '@angular/forms';

interface Holiday {
  _id: string;
  developer: {
    _id: string;
    username: string;
    email: string;
  };
  developerName: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: string;
  appliedOn: string;
}

@Component({
  selector: 'app-leave',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './leave.component.html',
  styleUrls: ['./leave.component.css']
})
export class LeaveComponent implements OnInit {
  holidays: Holiday[] = [];
  loading = false;
  error = '';

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadHolidays();
  }

  loadHolidays(): void {
    this.loading = true;
    this.adminService.getAllHolidays().subscribe({
      next: (data) => {
        this.holidays = data;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load holidays';
        this.loading = false;
        console.error('Error loading holidays:', error);
      }
    });
  }

  handleHolidayDecision(holidayId: string, decision: 'Approved' | 'Denied'): void {
    this.loading = true;
    this.error = '';
    
    this.adminService.approveOrDenyHoliday(holidayId, decision).subscribe({
      next: () => {
        this.loadHolidays(); // Reload the list after decision
        this.loading = false;
      },
      error: (error) => {
        console.error('Error updating holiday status:', error);
        this.error = error.error?.message || 'Failed to update holiday status';
        this.loading = false;
      }
    });
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  calculateDuration(startDate: string, endDate: string): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end dates
  }
}
