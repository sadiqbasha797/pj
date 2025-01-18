import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DeveloperService } from '../../services/developer.service';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

// Add Project interface
interface Project {
  _id: string;
  title: string;
  description: string;
  deadline: string;
  status: string;
  relatedDocs: string[];
}

// Add Task interface
interface Task {
  _id: string;
  taskName: string;
  startDate: string;
  endDate: string;
  projectId: {
    _id: string;
    title: string;
  };
  status: string;
  description?: string;
}

// Add Calendar Event interface
interface CalendarEvent {
  _id: string;
  title: string;
  eventDate: string;
  eventType: string;
  description?: string;
  location?: string;
  status: string;
}

// Add Holiday interface
interface Holiday {
  _id: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: string;
}

@Component({
  selector: 'app-dashboard-developer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-developer.component.html',
  styleUrl: './dashboard-developer.component.css'
})
export class DashboardDeveloperComponent implements OnInit {
  username = '';
  projects: Project[] = [];
  projectStats = {
    assigned: 0,
    started: 0,
    inProgress: 0,
    testing: 0,
    completed: 0
  };

  tasks: Task[] = [];
  taskStats = {
    assigned: 0,
    started: 0,
    inProgress: 0,
    testing: 0,
    completed: 0
  };

  calendarEvents: CalendarEvent[] = [];
  eventStats = {
    total: 0,
    upcoming: 0,
    today: 0,
    thisWeek: 0
  };

  holidays: Holiday[] = [];
  leaveStats = {
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    upcoming: 0
  };

  private projectChart: Chart<'doughnut', number[], string> | null = null;
  private taskChart: Chart<'bar', number[], string> | null = null;

  constructor(private developerService: DeveloperService) {}

  ngOnInit() {
    this.username = localStorage.getItem('username') || 'Developer';
    // Load all data first
    Promise.all([
      this.loadProjects(),
      this.loadTasks(),
      this.loadCalendarEvents(),
      this.loadHolidays()
    ]).then(() => {
      // Initialize charts after data is loaded
      setTimeout(() => {
        this.initializeCharts();
      }, 0);
    });
  }

  loadProjects() {
    return new Promise<void>((resolve) => {
      this.developerService.getAssignedProjects().subscribe({
        next: (data) => {
          this.projects = data;
          this.calculateProjectStats();
          resolve();
        },
        error: (error) => {
          console.error('Error loading projects:', error);
          resolve();
        }
      });
    });
  }

  private calculateProjectStats() {
    this.projectStats = {
      assigned: this.projects.filter(p => p.status === 'Assigned').length,
      started: this.projects.filter(p => p.status === 'Started').length,
      inProgress: this.projects.filter(p => p.status === 'In-Progress').length,
      testing: this.projects.filter(p => p.status === 'Testing').length,
      completed: this.projects.filter(p => p.status === 'Completed').length
    };
  }

  loadTasks() {
    return new Promise<void>((resolve) => {
      this.developerService.getAssignedTasks().subscribe({
        next: (data) => {
          this.tasks = data;
          this.calculateTaskStats();
          resolve();
        },
        error: (error) => {
          console.error('Error loading tasks:', error);
          resolve();
        }
      });
    });
  }

  private calculateTaskStats() {
    this.taskStats = {
      assigned: this.tasks.filter(t => t.status === 'Assigned').length,
      started: this.tasks.filter(t => t.status === 'Started').length,
      inProgress: this.tasks.filter(t => t.status === 'In-Progress').length,
      testing: this.tasks.filter(t => t.status === 'Testing').length,
      completed: this.tasks.filter(t => t.status === 'Completed').length
    };
  }

  loadCalendarEvents() {
    this.developerService.fetchDeveloperEvents().subscribe({
      next: (events) => {
        this.calendarEvents = events;
        this.calculateEventStats();
      },
      error: (error) => {
        console.error('Error loading calendar events:', error);
      }
    });
  }

  private calculateEventStats() {
    const now = new Date();
    const weekFromNow = new Date(now);
    weekFromNow.setDate(weekFromNow.getDate() + 7);

    this.eventStats.total = this.calendarEvents.length;
    
    this.eventStats.upcoming = this.calendarEvents.filter(event => 
      new Date(event.eventDate) > now
    ).length;

    this.eventStats.today = this.calendarEvents.filter(event => 
      new Date(event.eventDate).toDateString() === now.toDateString()
    ).length;

    this.eventStats.thisWeek = this.calendarEvents.filter(event => {
      const eventDate = new Date(event.eventDate);
      return eventDate > now && eventDate <= weekFromNow;
    }).length;
  }

  loadHolidays() {
    this.developerService.fetchHolidays().subscribe({
      next: (data) => {
        this.holidays = data;
        this.calculateLeaveStats();
      },
      error: (error) => {
        console.error('Error loading holidays:', error);
      }
    });
  }

  private calculateLeaveStats() {
    const now = new Date();
    
    this.leaveStats.total = this.holidays.length;
    this.leaveStats.pending = this.holidays.filter(h => h.status === 'Pending').length;
    this.leaveStats.approved = this.holidays.filter(h => h.status === 'Approved').length;
    this.leaveStats.rejected = this.holidays.filter(h => h.status === 'Rejected').length;
    
    // Count upcoming approved leaves
    this.leaveStats.upcoming = this.holidays.filter(h => 
      h.status === 'Approved' && 
      new Date(h.startDate) > now
    ).length;
  }

  getUpcomingTasks() {
    return this.tasks
      .filter(task => new Date(task.endDate) > new Date())
      .sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime())
      .slice(0, 5); // Get top 5 upcoming tasks
  }

  getRecentTasks() {
    return this.tasks
      .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
      .slice(0, 5); // Get 5 most recent tasks
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString();
  }

  getUpcomingEvents() {
    const now = new Date();
    return this.calendarEvents
      .filter(event => new Date(event.eventDate) > now)
      .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime())
      .slice(0, 5); // Get top 5 upcoming events
  }

  getTodayEvents() {
    const today = new Date().toDateString();
    return this.calendarEvents
      .filter(event => new Date(event.eventDate).toDateString() === today)
      .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime());
  }

  getUpcomingLeaves() {
    const now = new Date();
    return this.holidays
      .filter(holiday => 
        holiday.status === 'Approved' && 
        new Date(holiday.startDate) > now
      )
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
      .slice(0, 5); // Get top 5 upcoming leaves
  }

  getPendingLeaves() {
    return this.holidays
      .filter(holiday => holiday.status === 'Pending')
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  }

  calculateLeaveDuration(startDate: string, endDate: string): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // Add 1 to include both start and end dates
  }

  private initializeCharts() {
    // Destroy existing charts if they exist
    if (this.projectChart) {
      this.projectChart.destroy();
    }
    if (this.taskChart) {
      this.taskChart.destroy();
    }

    const projectCtx = document.getElementById('projectChart') as HTMLCanvasElement;
    const taskCtx = document.getElementById('taskChart') as HTMLCanvasElement;

    if (!projectCtx || !taskCtx) {
      console.error('Canvas elements not found');
      return;
    }

    // Get computed styles for dark mode colors
    const isDarkMode = document.documentElement.classList.contains('dark');
    const textColor = isDarkMode ? '#e5e7eb' : '#374151'; // gray-200 : gray-700
    const gridColor = isDarkMode ? 'rgba(107, 114, 128, 0.1)' : 'rgba(107, 114, 128, 0.1)'; // gray-500 at 10% opacity

    const projectChartColors = isDarkMode 
      ? ['rgb(129, 140, 248)', 'rgb(99, 102, 241)', 'rgb(79, 70, 229)', 'rgb(67, 56, 202)', 'rgb(55, 48, 163)']
      : ['rgb(99, 102, 241)', 'rgb(129, 140, 248)', 'rgb(165, 180, 252)', 'rgb(199, 210, 254)', 'rgb(224, 231, 255)'];

    const taskChartColors = isDarkMode
      ? ['rgb(129, 140, 248)', 'rgb(99, 102, 241)', 'rgb(79, 70, 229)', 'rgb(67, 56, 202)', 'rgb(55, 48, 163)'] 
      : ['rgb(99, 102, 241)', 'rgb(129, 140, 248)', 'rgb(165, 180, 252)', 'rgb(199, 210, 254)', 'rgb(224, 231, 255)'];

    this.projectChart = new Chart(projectCtx, {
      type: 'doughnut',
      data: {
        labels: ['Assigned', 'Started', 'In-Progress', 'Testing', 'Completed'],
        datasets: [{
          data: [
            this.projectStats.assigned,
            this.projectStats.started,
            this.projectStats.inProgress,
            this.projectStats.testing,
            this.projectStats.completed
          ],
          backgroundColor: projectChartColors,
          borderWidth: 1,
          borderColor: isDarkMode ? '#1f2937' : '#ffffff' // gray-800 : white
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
              color: textColor,
              font: {
                size: 12
              }
            }
          },
          title: {
            display: true,
            text: 'Project Status Distribution',
            color: textColor,
            font: {
              size: 16
            }
          }
        },
        cutout: '60%'
      }
    });

    this.taskChart = new Chart(taskCtx, {
      type: 'bar',
      data: {
        labels: ['Assigned', 'Started', 'In-Progress', 'Testing', 'Completed'],
        datasets: [{
          label: 'Tasks by Status',
          data: [
            this.taskStats.assigned,
            this.taskStats.started,
            this.taskStats.inProgress,
            this.taskStats.testing,
            this.taskStats.completed
          ],
          backgroundColor: taskChartColors,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: isDarkMode ? '#1f2937' : '#ffffff' // gray-800 : white
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          title: {
            display: true,
            text: 'Task Status Distribution',
            color: textColor,
            font: {
              size: 16
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: gridColor,
              display: true
            },
            border: {
              color: textColor,
              display: true
            },
            ticks: {
              color: textColor
            }
          },
          x: {
            grid: {
              display: false
            },
            border: {
              color: textColor,
              display: true
            },
            ticks: {
              color: textColor
            }
          }
        }
      }
    });
  }

  getRecentLeaves() {
    return this.holidays
      .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
      .slice(0, 4); // Get 4 most recent leaves
  }

  getRecentEvents() {
    return this.calendarEvents
      .sort((a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime())
      .slice(0, 4); // Get 4 most recent events
  }
}
