import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, registerables } from 'chart.js';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MarketerService } from '../../services/marketer.services';
import { LoaderService } from '../../services/loader.service';

Chart.register(...registerables);

interface TaskUpdate {
  status: string;
  // add other properties as needed
}

interface Revenue {
  revenueGenerated: number;
  date: string;
  projectId?: {
    title: string;
  };
  // add other properties as needed
}

interface Project {
  status: string;
  tasks?: any[];
  title: string;
  // add other properties as needed
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatCardModule, MatIconModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  revenueData: Revenue[] = [];
  taskUpdates: TaskUpdate[] = [];
  projects: Project[] = [];
  
  // Charts
  revenueChart: any;
  taskStatusChart: any;
  projectProgressChart: any;
  
  // Table data
  displayedColumns: string[] = ['project', 'revenue', 'date'];
  recentRevenue: any[] = [];
  
  // Summary metrics
  totalRevenue: number = 0;
  totalTasks: number = 0;
  completedTasks: number = 0;
  activeProjects: number = 0;

  constructor(
    private marketerService: MarketerService,
    private loaderService: LoaderService
  ) {}

  ngOnInit() {
    this.loadDashboardData();
  }

  private async loadDashboardData() {
    this.loaderService.show();
    try {
      await Promise.all([
        this.loadRevenue(),
        this.loadProjects(),
        this.loadTaskUpdates()
      ]);
      
      this.initializeCharts();
      this.calculateMetrics();
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      this.loaderService.hide();
    }
  }

  private loadRevenue() {
    return new Promise((resolve) => {
      this.marketerService.getAllRevenue().subscribe({
        next: (response) => {
          this.revenueData = (response.data || response || []).map((rev: any) => ({
            ...rev,
            revenueGenerated: Number(rev.revenueGenerated) || 0
          }));
          this.recentRevenue = this.revenueData.slice(0, 5);
          resolve(true);
        },
        error: (error) => {
          console.error('Error loading revenue:', error);
          this.revenueData = [];
          this.recentRevenue = [];
          resolve(false);
        }
      });
    });
  }

  private loadProjects() {
    return new Promise((resolve) => {
      this.marketerService.getProjects().subscribe({
        next: (response) => {
          this.projects = Array.isArray(response) ? response : [];
          resolve(true);
        },
        error: (error) => {
          console.error('Error loading projects:', error);
          this.projects = [];
          resolve(false);
        }
      });
    });
  }

  private loadTaskUpdates() {
    return new Promise((resolve) => {
      this.marketerService.getAssignedMarketingTasks().subscribe({
        next: (response) => {
          this.taskUpdates = (Array.isArray(response) ? response : []).map((task: any) => ({
            ...task,
            status: task.status || 'pending'
          }));
          resolve(true);
        },
        error: (error) => {
          console.error('Error loading tasks:', error);
          this.taskUpdates = [];
          resolve(false);
        }
      });
    });
  }

  private initializeCharts() {
    const revenueCtx = document.getElementById('revenueChart') as HTMLCanvasElement;
    const taskCtx = document.getElementById('taskStatusChart') as HTMLCanvasElement;
    const projectCtx = document.getElementById('projectProgressChart') as HTMLCanvasElement;

    if (revenueCtx) {
      this.initRevenueChart();
    }
    if (taskCtx) {
      this.initTaskStatusChart();
    }
    if (projectCtx) {
      this.initProjectProgressChart();
    }
  }

  private initRevenueChart() {
    const ctx = document.getElementById('revenueChart') as HTMLCanvasElement;
    const monthlyRevenue = this.calculateMonthlyRevenue();
    
    this.revenueChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: monthlyRevenue.labels,
        datasets: [{
          label: 'Monthly Revenue',
          data: monthlyRevenue.data,
          borderColor: '#4F46E5',
          tension: 0.1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Revenue Trend'
          }
        }
      }
    });
  }

  private initTaskStatusChart() {
    const ctx = document.getElementById('taskStatusChart') as HTMLCanvasElement;
    const taskStats = this.calculateTaskStats();
    
    this.taskStatusChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Completed', 'In Progress', 'Pending'],
        datasets: [{
          data: [
            taskStats.completed,
            taskStats.inProgress,
            taskStats.pending
          ],
          backgroundColor: ['#10B981', '#F59E0B', '#EF4444']
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Task Status Distribution'
          }
        }
      }
    });
  }

  private initProjectProgressChart() {
    const ctx = document.getElementById('projectProgressChart') as HTMLCanvasElement;
    const projectProgress = this.calculateProjectProgress();
    
    this.projectProgressChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: projectProgress.labels,
        datasets: [{
          label: 'Progress (%)',
          data: projectProgress.data,
          backgroundColor: '#6366F1'
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Project Progress'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 100
          }
        }
      }
    });
  }

  private calculateMonthlyRevenue() {
    const revenue = Array.isArray(this.revenueData) ? this.revenueData : [];
    const monthlyData: { [key: string]: number } = {};
    
    revenue.forEach(rev => {
      if (rev.date && rev.revenueGenerated) {
        const month = new Date(rev.date).toLocaleString('default', { month: 'short' });
        monthlyData[month] = (monthlyData[month] || 0) + Number(rev.revenueGenerated);
      }
    });

    return {
      labels: Object.keys(monthlyData),
      data: Object.values(monthlyData)
    };
  }

  private calculateTaskStats() {
    const tasks = Array.isArray(this.taskUpdates) ? this.taskUpdates : [];
    return {
      completed: tasks.filter(t => t.status === 'completed').length,
      inProgress: tasks.filter(t => t.status === 'in-progress').length,
      pending: tasks.filter(t => t.status === 'pending').length
    };
  }

  private calculateProjectProgress() {
    const projectsList = Array.isArray(this.projects) ? this.projects : [];
    
    const progress = projectsList.map(project => {
      const totalTasks = project.tasks?.length || 0;
      const completedTasks = project.tasks?.filter((t: any) => t.status === 'completed').length || 0;
      return (totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0);
    });

    return {
      labels: projectsList.map(p => p.title || 'Untitled Project'),
      data: progress
    };
  }

  private calculateMetrics() {
    const revenue = Array.isArray(this.revenueData) ? this.revenueData : [];
    const tasks = Array.isArray(this.taskUpdates) ? this.taskUpdates : [];
    const projectsList = Array.isArray(this.projects) ? this.projects : [];

    this.totalRevenue = revenue.reduce((sum, rev) => sum + (Number(rev.revenueGenerated) || 0), 0);
    this.totalTasks = tasks.length;
    this.completedTasks = tasks.filter(t => t.status === 'completed').length;
    this.activeProjects = projectsList.filter(p => p.status === 'active').length;
  }
}
