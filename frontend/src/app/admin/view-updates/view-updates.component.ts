import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../services/admin.service';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-view-updates',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './view-updates.component.html',
  styleUrl: './view-updates.component.css'
})
export class ViewUpdatesComponent implements OnInit {
  taskUpdates: any[] = [];
  newComment: string = '';
  selectedUpdateId: string = '';
  taskId: string = '';
  task: any = null;
  showComments: { [key: string]: boolean } = {};
  showLeadsInfo: { [key: string]: boolean } = {};
  filteredTaskUpdates: any[] = [];
  filterDateFrom: string = '';
  filterDateTo: string = '';
  filterUpdatedBy: string = '';
  filterDescription: string = '';
  isFilterVisible: boolean = false;

  constructor(
    private adminService: AdminService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.taskId = params['taskId'];
      if (this.taskId) {
        this.loadTaskDetails();
        this.loadTaskUpdates();
      }
    });
  }

  loadTaskDetails() {
    this.adminService.getMarketingTaskById(this.taskId).subscribe({
      next: (task) => {
        this.task = task;
      },
      error: (error) => {
        console.error('Error loading task details:', error);
      }
    });
  }

  loadTaskUpdates() {
    this.adminService.getTaskUpdates(this.taskId).subscribe({
      next: (updates) => {
        this.taskUpdates = updates;
        this.applyFilters();
      },
      error: (error) => {
        console.error('Error loading task updates:', error);
      }
    });
  }

  toggleComments(updateId: string) {
    this.showComments[updateId] = !this.showComments[updateId];
  }

  toggleLeadsInfo(updateId: string) {
    this.showLeadsInfo[updateId] = !this.showLeadsInfo[updateId];
  }

  addComment(updateId: string) {
    if (!this.newComment.trim()) return;

    this.adminService.addComment(updateId, { text: this.newComment }).subscribe({
      next: () => {
        this.loadTaskUpdates();
        this.newComment = '';
        this.selectedUpdateId = '';
      },
      error: (error) => {
        console.error('Error adding comment:', error);
      }
    });
  }

  deleteComment(updateId: string, commentId: string) {
    this.adminService.deleteComment(updateId, commentId).subscribe({
      next: () => {
        this.loadTaskUpdates();
      },
      error: (error) => {
        console.error('Error deleting comment:', error);
      }
    });
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  applyFilters() {
    this.filteredTaskUpdates = this.taskUpdates.filter(update => {
      const dateMatches = (!this.filterDateFrom || new Date(update.createdAt) >= new Date(this.filterDateFrom)) &&
                         (!this.filterDateTo || new Date(update.createdAt) <= new Date(this.filterDateTo));
      
      const updatedByMatches = !this.filterUpdatedBy || 
                              update.updatedBy.name.toLowerCase().includes(this.filterUpdatedBy.toLowerCase());
      
      const descriptionMatches = !this.filterDescription || 
                                update.description.toLowerCase().includes(this.filterDescription.toLowerCase());
      
      return dateMatches && updatedByMatches && descriptionMatches;
    });
  }

  clearFilters() {
    this.filterDateFrom = '';
    this.filterDateTo = '';
    this.filterUpdatedBy = '';
    this.filterDescription = '';
    this.applyFilters();
  }

  hasActiveFilters(): boolean {
    return !!(this.filterDateFrom || this.filterDateTo || 
              this.filterUpdatedBy || this.filterDescription);
  }

  clearDateFilters() {
    this.filterDateFrom = '';
    this.filterDateTo = '';
    this.applyFilters();
  }
}
