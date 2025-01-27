import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CreatorService } from '../../services/creator.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-task-creator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './task-creator.component.html',
  styleUrl: './task-creator.component.css'
})
export class TaskCreatorComponent implements OnInit {
  tasks: any[] = [];
  errorMessage = '';
  loading = true;

  constructor(
    private creatorService: CreatorService,
    private router: Router
  ) {}

  ngOnInit() {
    if (!this.creatorService.isLoggedIn()) {
      this.router.navigate(['/content-creator/login']);
      return;
    }
    
    this.loadTasks();
  }

  loadTasks() {
    this.creatorService.getAssignedTasks().subscribe({
      next: (response) => {
        this.tasks = response.tasks;
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = error.error.message || 'Failed to load tasks';
        this.loading = false;
      }
    });
  }

  getStatusColor(status: string): string {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'in-progress':
        return 'text-blue-600 bg-blue-100';
      case 'completed':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  viewUpdates(taskId: string) {
    this.router.navigate(['/content-creator/updates'], { 
      queryParams: { taskId: taskId }
    });
  }
}
