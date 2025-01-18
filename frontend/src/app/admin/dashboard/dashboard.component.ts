import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AdminService } from '../../services/admin.service';
import { LoaderService } from '../../services/loader.service';
import { Chart, registerables } from 'chart.js';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatCardModule, MatIconModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  adminName: string = '';
  totalDevelopers: number = 0;
  totalManagers: number = 0;
  totalProjects: number = 0;
  totalTasks: number = 0;
  totalEvents: number = 0;
  recentTasks: any[] = [];
  upcomingEvents: any[] = [];
  developers: any[] = [];
  managers: any[] = [];
  projectStatus: any = {
    assigned: 0,
    started: 0,
    inProgress: 0,
    testing: 0,
    completed: 0
  };
  taskStatus: any = {
    assigned: 0,
    started: 0,
    inProgress: 0,
    completed: 0,
    testing: 0
  };

  constructor(
    private adminService: AdminService, 
    private router: Router,
    private loaderService: LoaderService
  ) {}

  ngOnInit() {
    this.loadAdminProfile();
    this.loadDashboardData();
  }

  private loadAdminProfile() {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      this.router.navigate(['/admin/login']);
      return;
    }

    this.adminService.getProfile().subscribe({
      next: (response) => {
        this.adminName = response?.admin?.username || response?.username || 'Admin';
      },
      error: (error) => {
        console.error('Error fetching admin profile:', error);
        this.router.navigate(['/admin/login']);
      }
    });
  }

  private loadDashboardData() {
    this.loaderService.show();
    
    // Load all required data
    Promise.all([
      this.loadUsers(),
      this.loadProjects(),
      this.loadTasks(),
      this.loadEvents()
    ]).finally(() => {
      this.loaderService.hide();
      this.initializeCharts();
    });
  }

  private loadUsers() {
    return Promise.all([
      new Promise<void>((resolve) => {
        this.adminService.getAllDevelopers().subscribe({
          next: (developers) => {
            this.developers = developers.map((dev: { _id: any; username: any; email: any; skills: any; verified: any; role: any; createdAt: any; }) => ({
              id: dev._id,
              username: dev.username,
              email: dev.email,
              skills: dev.skills,
              verified: dev.verified,
              role: dev.role,
              createdAt: dev.createdAt
            }));
            this.totalDevelopers = developers.length;
            resolve();
          },
          error: (error) => {
            console.error('Error loading developers:', error);
            resolve();
          }
        });
      }),
      new Promise<void>((resolve) => {
        this.adminService.getAllManagers().subscribe({
          next: (managers) => {
            this.managers = managers.map((mgr: { _id: any; username: any; email: any; teamSize: any; role: any; createdAt: any; developers: any; mobile: any; image: any; }) => ({
              id: mgr._id,
              username: mgr.username,
              email: mgr.email,
              teamSize: mgr.teamSize,
              role: mgr.role,
              createdAt: mgr.createdAt,
              developers: mgr.developers,
              mobile: mgr.mobile,
              image: mgr.image
            }));
            this.totalManagers = managers.length;
            resolve();
          },
          error: (error) => {
            console.error('Error loading managers:', error);
            resolve();
          }
        });
      })
    ]);
  }

  private loadProjects() {
    return new Promise<void>((resolve) => {
      this.adminService.getAllProjects().subscribe({
        next: (projects) => {
          this.totalProjects = projects.length;
          this.projectStatus = {
            assigned: projects.filter((p: any) => p.status === 'Assigned').length,
            started: projects.filter((p: any) => p.status === 'Started').length,
            inProgress: projects.filter((p: any) => p.status === 'In-Progress').length,
            testing: projects.filter((p: any) => p.status === 'Testing').length,
            completed: projects.filter((p: any) => p.status === 'Completed').length
          };
          resolve();
        },
        error: (error) => {
          console.error('Error loading projects:', error);
          resolve();
        }
      });
    });
  }

  private loadTasks() {
    return new Promise<void>((resolve) => {
      this.adminService.getAllTasks().subscribe({
        next: (tasks) => {
          this.totalTasks = tasks.length;
          this.taskStatus = {
            assigned: tasks.filter((t: any) => t.status === 'Assigned').length,
            started: tasks.filter((t: any) => t.status === 'Started').length,
            inProgress: tasks.filter((t: any) => t.status === 'In-Progress').length,
            completed: tasks.filter((t: any) => t.status === 'Completed').length,
            testing: tasks.filter((t: any) => t.status === 'Testing').length
          };
          this.recentTasks = tasks
            .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 5);
          resolve();
        },
        error: (error) => {
          console.error('Error loading tasks:', error);
          resolve();
        }
      });
    });
  }

  private loadEvents() {
    return new Promise<void>((resolve) => {
      this.adminService.getAllEvents().subscribe({
        next: (events) => {
          this.totalEvents = events.length;
          const now = new Date();
          this.upcomingEvents = events
            .filter((event: any) => new Date(event.eventDate) > now)
            .sort((a: any, b: any) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime())
            .slice(0, 5);
          resolve();
        },
        error: (error) => {
          console.error('Error loading events:', error);
          resolve();
        }
      });
    });
  }

  private initializeCharts() {
    this.initializeProjectStatusChart();
    this.initializeTaskStatusChart();
    this.initializeTeamDistributionChart();
  }

  private initializeProjectStatusChart() {
    const ctx = document.getElementById('projectStatusChart') as HTMLCanvasElement;
    new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Assigned', 'Started', 'In-Progress', 'Testing', 'Completed'],
        datasets: [{
          data: [
            this.projectStatus.assigned,
            this.projectStatus.started,
            this.projectStatus.inProgress,
            this.projectStatus.testing,
            this.projectStatus.completed
          ],
          backgroundColor: [
            '#845EC2',  // Deep Purple Blue
            '#2C73D2',  // Rich Blue
            '#0081CF',  // Ocean Blue
            '#D65DB1',  // Deep Rose
            '#FF6F91'   // Dark Coral
          ],
          borderWidth: 1,
          borderColor: '#ffffff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 20,
              usePointStyle: true,
              font: {
                size: 12
              }
            }
          }
        },
        cutout: '55%'
      }
    });
  }

  private initializeTaskStatusChart() {
    const ctx = document.getElementById('taskStatusChart') as HTMLCanvasElement;
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Assigned', 'Started', 'In-Progress', 'Completed', 'Testing'],
        datasets: [{
          label: 'Tasks by Status',
          data: [
            this.taskStatus.assigned,
            this.taskStatus.started,
            this.taskStatus.inProgress,
            this.taskStatus.completed,
            this.taskStatus.testing
          ],
          backgroundColor: [
            '#845EC2',  // Deep Purple Blue
            '#2C73D2',  // Rich Blue
            '#0081CF',  // Ocean Blue
            '#D65DB1',  // Deep Rose
            '#FF6F91'   // Dark Coral
          ],
          borderRadius: 8,
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.5)'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              display: false
            },
            border: {
              display: true
            }
          },
          x: {
            grid: {
              display: false
            },
            border: {
              display: true
            }
          }
        }
      }
    });
  }

  private initializeTeamDistributionChart() {
    const ctx = document.getElementById('teamDistributionChart') as HTMLCanvasElement;
    new Chart(ctx, {
      type: 'pie',
      data: {
        labels: ['Developers', 'Managers'],
        datasets: [{
          data: [this.totalDevelopers, this.totalManagers],
          backgroundColor: [
            '#008FFB',  // Bright Blue
            '#FF4560'   // Hot Pink
          ],
          borderWidth: 1,
          borderColor: '#ffffff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 20,
              usePointStyle: true,
              font: {
                size: 12
              }
            }
          }
        }
      }
    });
  }

  getStatusClass(status: string): string {
    const statusClasses: { [key: string]: string } = {
      'Assigned': 'bg-amber-100 text-amber-800',
      'Started': 'bg-blue-100 text-blue-800',
      'In-Progress': 'bg-indigo-100 text-indigo-800',
      'Testing': 'bg-purple-100 text-purple-800',
      'Completed': 'bg-green-100 text-green-800'
    };
    return statusClasses[status] || 'bg-gray-100 text-gray-800';
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }
}
