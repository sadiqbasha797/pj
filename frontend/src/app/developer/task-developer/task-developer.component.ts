import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DeveloperService } from '../../services/developer.service';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ThemeService } from '../../services/theme.service';
import Swal from 'sweetalert2';
import { DeveloperAuthService } from '../../services/developer-auth.service';

interface Task {
  _id: string;
  taskName: string;
  startDate: string;
  endDate: string;
  projectId: {
    _id: string;
    title: string;
  };
  participants: {
    participantId: string;
    _id: string;
  }[];
  status: string;
  description?: string;
  relatedDocuments: string[];
  updates: {
    content: string;
    updatedBy: string;
    updatedByName: string;
    updatedByModel: string;
    relatedMedia: string[];
    _id: string;
    updateId: string;
    timestamp: string;
  }[];
  finalResult: {
    description?: string;
    resultImages: string[];
    updatedBy?: string;
  };
}

@Component({
  selector: 'app-task-developer',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './task-developer.component.html',
  styleUrls: ['./task-developer.component.css']
})
export class TaskDeveloperComponent implements OnInit {
  tasks: Task[] = [];
  expandedTaskId: string | null = null;
  updateForm: FormGroup;
  finalResultForm: FormGroup;
  selectedFiles: File[] = [];
  selectedFinalFiles: File[] = [];
  isDarkMode = true;
  currentDeveloperId: string = '';
  activeTab: { [key: string]: string } = {};
  selectedImage: string | null = null;

  constructor(
    private developerService: DeveloperService,
    private fb: FormBuilder,
    private themeService: ThemeService,
    private authService: DeveloperAuthService
  ) {
    this.themeService.darkMode$.subscribe(
      isDark => this.isDarkMode = isDark
    );
    this.updateForm = this.fb.group({
      content: [''],
      media: [null]
    });

    this.finalResultForm = this.fb.group({
      description: [''],
      resultImages: [null]
    });
    this.currentDeveloperId = this.authService.getCurrentUserId() || '';
  }

  ngOnInit() {
    this.loadTasks();
  }

  loadTasks() {
    this.developerService.getAssignedTasks().subscribe({
      next: (response) => {
        this.tasks = response;
        this.tasks.forEach(task => {
          this.activeTab[task._id] = 'details'; // Default to details tab
        });
      },
      error: (error) => {
        console.error('Error loading tasks:', error);
      }
    });
  }

  toggleTask(taskId: string) {
    this.expandedTaskId = this.expandedTaskId === taskId ? null : taskId;
  }

  setActiveTab(taskId: string, tab: string) {
    this.activeTab[taskId] = tab;
  }

  getTaskProgress(status: string): number {
    switch (status) {
      case 'Assigned': return 10;
      case 'In-Progress': return 50;
      case 'Testing': return 80;
      case 'Completed': return 100;
      default: return 0;
    }
  }

  getProgressBarColor(status: string): string {
    switch (status) {
      case 'Assigned': return 'bg-blue-500';
      case 'In-Progress': return 'bg-yellow-500';
      case 'Testing': return 'bg-purple-500';
      case 'Completed': return 'bg-green-500';
      default: return 'bg-gray-300';
    }
  }

  onFileSelect(event: any) {
    this.selectedFiles = Array.from(event.target.files);
  }

  onFinalFileSelect(event: any) {
    this.selectedFinalFiles = Array.from(event.target.files);
  }

  private showSuccessAlert(message: string) {
    Swal.fire({
      title: 'Success!',
      text: message,
      icon: 'success',
      confirmButtonColor: '#9333ea',
      confirmButtonText: 'OK'
    });
  }

  private showErrorAlert(message: string) {
    Swal.fire({
      title: 'Error!',
      text: message,
      icon: 'error',
      confirmButtonColor: '#dc2626',
      confirmButtonText: 'OK'
    });
  }

  submitUpdate(taskId: string) {
    if (this.updateForm.valid) {
      const formData = new FormData();
      formData.append('content', this.updateForm.get('content')?.value);
      
      this.selectedFiles.forEach(file => {
        formData.append('media', file);
      });

      this.developerService.addTaskUpdate(taskId, formData).subscribe({
        next: (response) => {
          this.showSuccessAlert('Update added successfully');
          this.loadTasks();
          this.updateForm.reset();
          this.selectedFiles = [];
        },
        error: (error) => {
          console.error('Error adding update:', error);
          this.showErrorAlert('Failed to add update. Please try again.');
        }
      });
    }
  }

  submitFinalResult(taskId: string) {
    if (this.finalResultForm.valid) {
      const formData = new FormData();
      formData.append('description', this.finalResultForm.get('description')?.value);
      
      this.selectedFinalFiles.forEach(file => {
        formData.append('resultImages', file);
      });

      this.developerService.addFinalResult(taskId, formData).subscribe({
        next: (response) => {
          this.showSuccessAlert('Final result added successfully');
          this.loadTasks();
          this.finalResultForm.reset();
          this.selectedFinalFiles = [];
        },
        error: (error) => {
          console.error('Error adding final result:', error);
          this.showErrorAlert('Failed to add final result. Please try again.');
        }
      });
    }
  }

  deleteUpdate(taskId: string, updateId: string) {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this update!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#9333ea',
      cancelButtonColor: '#dc2626',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.developerService.deleteTaskUpdate(taskId, updateId).subscribe({
          next: () => {
            this.showSuccessAlert('Update deleted successfully');
            this.loadTasks();
          },
          error: (error) => {
            console.error('Error deleting update:', error);
            this.showErrorAlert('Failed to delete update. Please try again.');
          }
        });
      }
    });
  }

  viewImage(imageUrl: string) {
    this.selectedImage = imageUrl;
  }

  closeImageViewer() {
    this.selectedImage = null;
  }

  canDeleteUpdate(update: any): boolean {
    return update.updatedBy === this.currentDeveloperId;
  }
}
