import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DeveloperService } from '../../services/developer.service';
import { ThemeService } from '../../services/theme.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-leave-developer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './leave-developer.component.html'
})
export class LeaveDeveloperComponent implements OnInit {
  holidays: any[] = [];
  newHoliday = {
    startDate: '',
    endDate: '',
    reason: ''
  };
  isDarkMode = false;

  constructor(
    private developerService: DeveloperService,
    private themeService: ThemeService
  ) {
    this.themeService.darkMode$.subscribe(
      isDark => this.isDarkMode = isDark
    );
  }

  ngOnInit() {
    this.loadHolidays();
  }

  loadHolidays() {
    this.developerService.fetchHolidays().subscribe({
      next: (data) => {
        this.holidays = data;
      },
      error: (error) => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to fetch leave requests',
          confirmButtonColor: '#3B82F6'
        });
        console.error('Error fetching holidays:', error);
      }
    });
  }

  private getSwalConfig(isDark: boolean) {
    return {
      background: isDark ? '#1F2937' : '#FFFFFF',
      color: isDark ? '#E5E7EB' : '#1F2937',
      confirmButtonColor: isDark ? '#4F46E5' : '#1F2937',
      cancelButtonColor: isDark ? '#DC2626' : '#991B1B'
    };
  }

  applyForHoliday() {
    const swalConfig = this.getSwalConfig(this.isDarkMode);
    
    if (new Date(this.newHoliday.startDate) > new Date(this.newHoliday.endDate)) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Dates',
        text: 'End date cannot be before start date',
        ...swalConfig
      });
      return;
    }

    Swal.fire({
      title: 'Confirm Leave Application',
      text: 'Are you sure you want to submit this leave request?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, submit',
      cancelButtonText: 'Cancel',
      ...swalConfig
    }).then((result) => {
      if (result.isConfirmed) {
        this.developerService.applyForHoliday(this.newHoliday).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: 'Success',
              text: 'Leave request submitted successfully',
              ...swalConfig
            });
            this.loadHolidays();
            this.newHoliday = {
              startDate: '',
              endDate: '',
              reason: ''
            };
          },
          error: (error) => {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'Failed to submit leave request',
              ...swalConfig
            });
            console.error('Error applying for holiday:', error);
          }
        });
      }
    });
  }

  withdrawHoliday(holidayId: string) {
    const swalConfig = this.getSwalConfig(this.isDarkMode);
    
    Swal.fire({
      title: 'Withdraw Leave Request',
      text: 'Are you sure you want to withdraw this leave request?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, withdraw',
      cancelButtonText: 'Cancel',
      ...swalConfig
    }).then((result) => {
      if (result.isConfirmed) {
        this.developerService.withdrawHoliday(holidayId).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: 'Success',
              text: 'Leave request withdrawn successfully',
              ...swalConfig
            });
            this.loadHolidays();
          },
          error: (error) => {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'Failed to withdraw leave request',
              ...swalConfig
            });
            console.error('Error withdrawing holiday:', error);
          }
        });
      }
    });
  }
}
