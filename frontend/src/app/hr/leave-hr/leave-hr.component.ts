import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HRService } from '../../services/hr.service';
import { FormsModule } from '@angular/forms';

interface Holiday {
  _id: string;
  developer: string;
  developerName: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: string;
  appliedOn: string;
  role?: 'Developer' | 'DigitalMarketingRole' | 'ContentCreator';
  createdAt?: string;
  updatedAt?: string;
  approvedBy?: {
    name: string;
    role: string;
    approvedDate: string;
  };
}

@Component({
  selector: 'app-leave-hr',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './leave-hr.component.html',
  styleUrl: './leave-hr.component.css'
})
export class LeaveHrComponent implements OnInit {
  holidays: Holiday[] = [];
  loading = false;
  error = '';

  constructor(private hrService: HRService) {}

  ngOnInit(): void {
    this.loadHolidays();
  }

  loadHolidays(): void {
    this.loading = true;
    this.hrService.getAllHolidays().subscribe({
      next: (data: Holiday[]) => {
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

  handleHolidayDecision(holidayId: string, status: 'Approved' | 'Denied'): void {
    this.loading = true;
    this.error = '';
    
    this.hrService.approveOrDenyHoliday(holidayId, status).subscribe({
      next: () => {
        this.loadHolidays();
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
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  }
}
