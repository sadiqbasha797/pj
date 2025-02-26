import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ManagerService } from '../../services/manager.service';
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

interface ManagerProfile {
  developers: {
    developerId: string;
    developerName: string;
    assignedOn: string;
    _id: string;
  }[];
  digitalMarketingRoles: {
    roleId: string;
    roleName: string;
    marketerName: string;
    assignedOn: string;
    _id: string;
  }[];
  contentCreators: {
    roleId: string;
    roleName: string;
    creatorName: string;
    assignedOn: string;
    _id: string;
  }[];
}

@Component({
  selector: 'app-leave-manager',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './leave-manager.component.html',
  styleUrl: './leave-manager.component.css'
})
export class LeaveManagerComponent implements OnInit {
  holidays: Holiday[] = [];
  loading = false;
  error = '';
  assignedDeveloperIds: string[] = [];

  constructor(private managerService: ManagerService) {}

  ngOnInit(): void {
    this.loadManagerProfile();
  }

  loadManagerProfile(): void {
    this.loading = true;
    this.managerService.getManagerProfile().subscribe({
      next: (profile: ManagerProfile) => {
        this.assignedDeveloperIds = [
          ...profile.developers.map(dev => dev.developerId),
          ...profile.digitalMarketingRoles.map(marketer => marketer.roleId),
          ...profile.contentCreators.map(creator => creator.roleId)
        ];
        this.loadHolidays();
      },
      error: (error) => {
        this.error = 'Failed to load manager profile';
        this.loading = false;
        console.error('Error loading manager profile:', error);
      }
    });
  }

  loadHolidays(): void {
    this.loading = true;
    this.managerService.getAllHolidays().subscribe({
      next: (data: Holiday[]) => {
        // Filter holidays to only show assigned developers
        this.holidays = data.filter(holiday => 
          this.assignedDeveloperIds.includes(holiday.developer)
        );
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
    
    this.managerService.approveOrDenyHoliday(holidayId, decision).subscribe({
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

  getDeveloperEmail(developer: string): string {
    return 'Email not available';
  }
}
