import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ManagerService } from '../../services/manager.service';

interface TaskUpdate {
  _id: string;
  taskId: {
    _id: string;
    taskName: string;
    taskDescription: string;
  };
  description: string;
  startDate: string;
  endDate: string;
  attachments: string[];
  leadsInfo: {
    name: string;
    description: string;
    contact: string;
    email: string;
  }[];
  updatedBy: {
    id: string;
    name: string;
  };
  comments: {
    _id: string;
    text: string;
    createdBy: string;
    name: string;
    role: string;
    createdAt: string;
  }[];
  createdAt: string;
}

@Component({
  selector: 'app-updates-manager',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './updates-manager.component.html',
  styleUrl: './updates-manager.component.css'
})
export class UpdatesManagerComponent implements OnInit {
  updates: TaskUpdate[] = [];
  newComments: { [key: string]: string } = {};
  expandedRows: { [key: string]: boolean } = {};
  loading = false;
  error = '';
  taskId: string | null = null;

  constructor(
    private managerService: ManagerService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    // Get taskId from query parameters
    this.route.queryParams.subscribe(params => {
      this.taskId = params['taskId'];
      if (this.taskId) {
        this.loadTaskUpdates(this.taskId);
      } else {
        this.loadAllUpdates();
      }
    });
  }

  loadAllUpdates() {
    this.loading = true;
    this.managerService.getAllTasks().subscribe({
      next: (tasks) => {
        // For each task, get its updates
        tasks.forEach((task: any) => {
          this.managerService.getTaskUpdates(task._id).subscribe({
            next: (updates) => {
              this.updates = [...this.updates, ...updates];
              this.updates.sort((a, b) => 
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
              );
            },
            error: (error) => {
              console.error('Error loading updates:', error);
              this.error = 'Failed to load task updates';
            }
          });
        });
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading tasks:', error);
        this.error = 'Failed to load tasks';
        this.loading = false;
      }
    });
  }

  loadTaskUpdates(taskId: string) {
    this.loading = true;
    this.updates = [];
    this.managerService.getTaskUpdates(taskId).subscribe({
      next: (updates) => {
        this.updates = updates;
        this.updates.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading task updates:', error);
        this.error = 'Failed to load task updates';
        this.loading = false;
      }
    });
  }

  addComment(updateId: string) {
    if (!this.newComments[updateId]?.trim()) return;

    this.managerService.addComment(updateId, { text: this.newComments[updateId] }).subscribe({
      next: (response) => {
        const updateIndex = this.updates.findIndex(u => u._id === updateId);
        if (updateIndex !== -1) {
          this.updates[updateIndex] = response.taskUpdate;
        }
        this.newComments[updateId] = ''; // Clear the input
      },
      error: (error) => {
        console.error('Error adding comment:', error);
        this.error = 'Failed to add comment';
      }
    });
  }

  deleteComment(updateId: string, commentId: string) {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    this.managerService.deleteComment(updateId, commentId).subscribe({
      next: (response) => {
        const updateIndex = this.updates.findIndex(u => u._id === updateId);
        if (updateIndex !== -1) {
          this.updates[updateIndex] = response.taskUpdate;
        }
      },
      error: (error) => {
        console.error('Error deleting comment:', error);
        this.error = 'Failed to delete comment';
      }
    });
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleString();
  }

  toggleDetails(updateId: string) {
    this.expandedRows[updateId] = !this.expandedRows[updateId];
  }
}
