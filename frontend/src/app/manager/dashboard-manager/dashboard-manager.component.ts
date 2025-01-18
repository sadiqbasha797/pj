import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ManagerService } from '../../services/manager.service';
import { Chart, registerables } from 'chart.js';

@Component({
  selector: 'app-dashboard-manager',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-manager.component.html',
  styleUrl: './dashboard-manager.component.css'
})
export class DashboardManagerComponent implements OnInit {
  @ViewChild('projectChart') projectChartRef!: ElementRef;
  @ViewChild('taskChart') taskChartRef!: ElementRef;
  projectChart: any;
  taskChart: any;

  projects: any[] = [];
  developers: any[] = [];
  tasks: any[] = [];
  events: any[] = [];
  managerId: string = '';
  managerName: string = '';

  projectsCount: number = 0;
  tasksCount: number = 0;
  developersCount: number = 0;
  eventsCount: number = 0;

  incompleteTasks: any[] = [];
  managerDeveloperIds: string[] = [];
  managerProfile: any | null = null;
console: any;
recentLeaves: any[] = [];

  constructor(
    private managerService: ManagerService,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    this.managerName = localStorage.getItem('username') || '';
  }

  ngOnInit() {
    Chart.register(...registerables);
    this.loadManagerProfile();
  }

  private loadManagerProfile() {
    this.managerService.getManagerProfile().subscribe({
      next: (profile) => {
        this.managerProfile = profile;
        this.managerId = profile._id;
        this.managerDeveloperIds = profile.developers.map((dev: { developerId: string; }) => dev.developerId);
        this.loadDashboardData();
      },
      error: (error) => console.error('Error loading manager profile:', error)
    });
  }

  private loadDashboardData() {
    // Load projects
    this.managerService.getProjects().subscribe({
      next: (data) => {
        console.log(data);
        this.projects = data;
        this.projectsCount = this.projects.length;
        this.createProjectChart();
        this.changeDetectorRef.detectChanges();
      },
      error: (error) => console.error('Error loading projects:', error)
    });

    // Load developers
    this.managerService.getAllDevelopers().subscribe({
      next: (data) => {
        this.developers = data.filter((dev: any) => 
          this.managerDeveloperIds.includes(dev._id)
        );
        this.developersCount = this.developers.length;
        this.changeDetectorRef.detectChanges();
      },
      error: (error) => console.error('Error loading developers:', error)
    });

    // Load tasks
    this.managerService.getAllTasks().subscribe({
      next: (data) => {
        this.tasks = data.filter((task: { participants: any[]; }) => {
          const participantIds = task.participants.map(p => p.participantId._id);
          
          const hasManagerDevelopers = participantIds.some(id => 
            this.managerDeveloperIds.includes(id)
          );

          const isManagerParticipant = participantIds.includes(this.managerProfile?._id);

          return hasManagerDevelopers || isManagerParticipant;
        });

        this.tasksCount = this.tasks.length;

        this.incompleteTasks = this.tasks
          .filter(task => task.status !== 'Completed')
          .slice(0, 4);
          console.log(this.incompleteTasks);
        this.createTaskChart();
        this.changeDetectorRef.detectChanges();
      },
      error: (error) => console.error('Error loading tasks:', error)
    });

    // Load events
    this.managerService.getAllEvents().subscribe({
      next: (data) => {
        this.events = data.filter((event: { createdBy: string; participants: any[]; }) => 
          event.createdBy === this.managerId ||
          event.participants.some(p => p.participantId === this.managerId)
        );
        this.eventsCount = this.events.length;
        this.changeDetectorRef.detectChanges();
      },
      error: (error) => console.error('Error loading events:', error)
    });

    this.loadRecentLeaves();
  }

  private loadRecentLeaves() {
    this.managerService.getAllHolidays().subscribe({
      next: (data) => {
        const filteredLeaves = data.filter((leave: any) => 
          this.managerDeveloperIds.includes(leave.developer._id)
        );
        
        this.recentLeaves = filteredLeaves
          .sort((a: any, b: any) => new Date(b.appliedOn).getTime() - new Date(a.appliedOn).getTime())
          .slice(0, 4);
        
        this.changeDetectorRef.detectChanges();
      },
      error: (error) => console.error('Error loading leaves:', error)
    });
  }

  private createProjectChart() {
    if (this.projectChart) {
      this.projectChart.destroy();
    }

    const projectStatuses = this.projects.map(project => project.status);
    const statusCounts = projectStatuses.reduce((acc: any, status: string) => {
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    const labels = Object.keys(statusCounts);
    const data = Object.values(statusCounts);

    const ctx = this.projectChartRef.nativeElement.getContext('2d');
    this.projectChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: data,
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

  private createTaskChart() {
    if (this.taskChart) {
      this.taskChart.destroy();
    }

    const taskStatuses = this.tasks.map(task => task.status);
    const statusCounts = taskStatuses.reduce((acc: any, status: string) => {
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    const labels = Object.keys(statusCounts);
    const data = Object.values(statusCounts);

    const ctx = this.taskChartRef.nativeElement.getContext('2d');
    this.taskChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Tasks by Status',
          data: data,
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
}
