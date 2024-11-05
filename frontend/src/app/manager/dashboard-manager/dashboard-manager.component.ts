import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ManagerService } from '../../services/manager.service';

@Component({
  selector: 'app-dashboard-manager',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-manager.component.html',
  styleUrl: './dashboard-manager.component.css'
})
export class DashboardManagerComponent implements OnInit {
  projects: any[] = [];
  developers: any[] = [];
  tasks: any[] = [];

  constructor(private managerService: ManagerService) {}

  ngOnInit() {
    this.loadDashboardData();
  }

  private loadDashboardData() {
    // Load projects
    this.managerService.getProjects().subscribe({
      next: (data) => this.projects = data,
      error: (error) => console.error('Error loading projects:', error)
    });

    // Load developers
    this.managerService.getAllDevelopers().subscribe({
      next: (data) => this.developers = data,
      error: (error) => console.error('Error loading developers:', error)
    });
  }
}
