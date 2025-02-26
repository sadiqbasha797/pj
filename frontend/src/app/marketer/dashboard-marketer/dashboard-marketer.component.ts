import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MarketerService } from '../../services/marketer.services';
import { Chart, registerables } from 'chart.js';
import { LoaderService } from '../../services/loader.service';
Chart.register(...registerables);

@Component({
  selector: 'app-dashboard-marketer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-marketer.component.html',
  styleUrls: ['./dashboard-marketer.component.css']
})
export class DashboardMarketerComponent implements OnInit {
  tasks: any[] = [];
  taskUpdates: any[] = [];
  meetings: any[] = [];
  events: any[] = [];
  holidays: any[] = [];
  
  // Statistics
  totalTasks = 0;
  totalUpdates = 0;
  totalMeetings = 0;
  totalEvents = 0;
  totalHolidays = 0;
  
  // Charts
  private taskChart: Chart | null = null;
  private eventChart: Chart | null = null;
  
  loading = true;
  today: string | number | Date | undefined;

  constructor(
    private marketerService: MarketerService,
    private loaderService: LoaderService
  ) {}

  ngOnInit(): void {
    this.loaderService.show();
    this.loadAllData();
  }

  private async loadAllData() {
    try {
      await Promise.all([
        this.loadTasks(),
        this.loadMeetings(),
        this.loadEvents(),
        this.loadHolidays()
      ]);
      
      this.initializeCharts();
      this.loaderService.hide();
      this.loading = false;
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      this.loaderService.hide();
      this.loading = false;
    }
  }

  private async loadTasks() {
    this.marketerService.getAssignedMarketingTasks().subscribe({
      next: (response) => {
        this.tasks = response.tasks;
        this.totalTasks = this.tasks.length;
        this.updateTaskChart();
      },
      error: (error) => console.error('Error loading tasks:', error)
    });
  }

  updateTaskChart() {
    const ctx = document.getElementById('taskStatusChart') as HTMLCanvasElement;
    if (!ctx) return;

    if (this.taskChart) {
      this.taskChart.destroy();
    }

    const taskStatusCount = {
      pending: this.tasks.filter(t => t.status.toLowerCase() === 'pending').length,
      inProgress: this.tasks.filter(t => t.status.toLowerCase() === 'in-progress').length,
      completed: this.tasks.filter(t => t.status.toLowerCase() === 'completed').length
    };

    this.taskChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Pending', 'In Progress', 'Completed'],
        datasets: [{
          data: [taskStatusCount.pending, taskStatusCount.inProgress, taskStatusCount.completed],
          backgroundColor: [
            '#FCD34D', // yellow for pending
            '#60A5FA', // blue for in progress
            '#34D399'  // green for completed
          ],
          borderWidth: 1
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
              boxWidth: 12
            }
          }
        }
      }
    });
  }

  private async loadMeetings() {
    this.marketerService.getParticipatingMeetings().subscribe({
      next: (response) => {
        this.meetings = response.data;
        this.totalMeetings = this.meetings.length;
      },
      error: (error) => console.error('Error loading meetings:', error)
    });
  }

  private async loadEvents() {
    this.marketerService.getMarketingEvents().subscribe({
      next: (response) => {
        this.events = response.data;
        this.totalEvents = this.events.length;
        this.updateEventChart();
      },
      error: (error) => console.error('Error loading events:', error)
    });
  }

  updateEventChart() {
    const ctx = document.getElementById('eventTypeChart') as HTMLCanvasElement;
    if (!ctx) return;

    if (this.eventChart) {
      this.eventChart.destroy();
    }

    // Group events by type
    const eventTypes = this.events.reduce((acc: { [key: string]: number }, event) => {
      const type = event.eventType || 'Other';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    this.eventChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: Object.keys(eventTypes),
        datasets: [{
          label: 'Events by Type',
          data: Object.values(eventTypes),
          backgroundColor: [
            '#60A5FA', // blue
            '#34D399', // green
            '#F87171', // red
            '#818CF8', // indigo
            '#FBBF24'  // yellow
          ],
          borderWidth: 1
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
          x: {
            grid: {
              display: false
            }
          },
          y: {
            beginAtZero: true,
            grid: {
              display: false
            },
            ticks: {
              stepSize: 1
            }
          }
        }
      }
    });
  }

  private async loadHolidays() {
    this.marketerService.fetchHolidays().subscribe({
      next: (response) => {
        this.holidays = response.data;
        this.totalHolidays = this.holidays.length;
      },
      error: (error) => console.error('Error loading holidays:', error)
    });
  }

  private initializeCharts(): void {
    this.initTaskStatusChart();
    this.initEventTypeChart();
  }

  private initTaskStatusChart(): void {
    const ctx = document.getElementById('taskStatusChart') as HTMLCanvasElement;
    if (!ctx) return;

    if (this.taskChart) {
      this.taskChart.destroy();
    }

    const taskStatusCount = {
      pending: this.tasks.filter(t => t.status.toLowerCase() === 'pending').length,
      inProgress: this.tasks.filter(t => t.status.toLowerCase() === 'in-progress').length,
      completed: this.tasks.filter(t => t.status.toLowerCase() === 'completed').length
    };

    this.taskChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Pending', 'In Progress', 'Completed'],
        datasets: [{
          data: [taskStatusCount.pending, taskStatusCount.inProgress, taskStatusCount.completed],
          backgroundColor: [
            '#FCD34D', // yellow for pending
            '#60A5FA', // blue for in progress
            '#34D399'  // green for completed
          ],
          borderWidth: 1
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
              boxWidth: 12
            }
          }
        }
      }
    });
  }

  private initEventTypeChart(): void {
    const ctx = document.getElementById('eventTypeChart') as HTMLCanvasElement;
    if (!ctx) return;

    if (this.eventChart) {
      this.eventChart.destroy();
    }

    // Group events by type
    const eventTypes = this.events.reduce((acc: { [key: string]: number }, event) => {
      const type = event.eventType || 'Other';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    this.eventChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: Object.keys(eventTypes),
        datasets: [{
          label: 'Events by Type',
          data: Object.values(eventTypes),
          backgroundColor: [
            '#60A5FA', // blue
            '#34D399', // green
            '#F87171', // red
            '#818CF8', // indigo
            '#FBBF24'  // yellow
          ],
          borderWidth: 1
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
          x: {
            grid: {
              display: false
            }
          },
          y: {
            beginAtZero: true,
            grid: {
              display: false
            },
            ticks: {
              stepSize: 1
            }
          }
        }
      }
    });
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  getStatusColor(status: string): string {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }
}
