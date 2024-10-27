import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AdminService } from '../../services/admin.service';
import { LoaderService } from '../../services/loader.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  adminName: string = '';

  constructor(
    private adminService: AdminService, 
    private router: Router,
    private loaderService: LoaderService
  ) {}

  ngOnInit() {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      this.router.navigate(['/admin/login']);
      return;
    }

    this.loaderService.show();
    this.adminService.getProfile().subscribe({
      next: (response) => {
        console.log('Full profile response:', response);
        if (response && response.admin && response.admin.username) {
          this.adminName = response.admin.username;
        } else if (response && response.username) {
          this.adminName = response.username;
        } else {
          console.error('Unexpected response structure:', response);
          this.adminName = 'Admin';
        }
        this.loaderService.hide();
      },
      error: (error) => {
        console.error('Error fetching admin profile:', error);
        this.router.navigate(['/admin/login']);
        this.loaderService.hide();
      }
    });
  }

  logout() {
    localStorage.removeItem('adminToken');
    this.router.navigate(['/admin/login']);
  }
}
