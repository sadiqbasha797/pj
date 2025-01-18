import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdminService } from '../../services/admin.service';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

@Component({
  selector: 'app-marketing',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './marketing.component.html',
  styleUrl: './marketing.component.css'
})
export class MarketingComponent implements OnInit {
  marketingTasks: any[] = [];
  projects: any[] = [];
  taskForm: FormGroup;
  isLoading = false;
  showForm = false;
  selectedTask: any = null;
  digitalMarketers: any[] = [];
  contentCreators: any[] = [];
  showViewModal = false;
  selectedViewTask: any = null;
hoveredTaskId: any;

  constructor(
    private adminService: AdminService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.taskForm = this.fb.group({
      taskName: ['', Validators.required],
      taskDescription: ['', Validators.required],
      projectId: ['', Validators.required],
      priority: ['medium'],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      status: ['pending'],
      assignedTo: [[], Validators.required],
      relatedDocs: [[]]
    });
  }

  ngOnInit(): void {
    this.loadMarketingTasks();
    this.loadProjects();
    this.loadTeamMembers();
  }

  private showSuccessAlert(message: string) {
    Swal.fire({
      title: 'Success!',
      text: message,
      icon: 'success',
      confirmButtonText: 'OK'
    });
  }

  private showErrorAlert(message: string) {
    Swal.fire({
      title: 'Error!',
      text: message,
      icon: 'error',
      confirmButtonText: 'OK'
    });
  }

  loadMarketingTasks(): void {
    this.isLoading = true;
    this.adminService.getAllMarketingTasks().subscribe({
      next: (tasks) => {
        this.marketingTasks = tasks;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading tasks:', error);
        this.isLoading = false;
        this.showErrorAlert('Unable to load marketing tasks. Please try again later.');
      }
    });
  }

  loadProjects(): void {
    this.adminService.getAllProjects().subscribe({
      next: (projects) => {
        this.projects = projects;
      },
      error: (error) => {
        console.error('Error loading projects:', error);
        this.showErrorAlert('Unable to load projects. Please try again later.');
      }
    });
  }

  loadTeamMembers(): void {
    this.adminService.getAllDigitalMarketingMembers().subscribe({
      next: (response: any) => {
        this.digitalMarketers = response.data;
      },
      error: (error) => {
        console.error('Error loading digital marketers:', error);
        this.showErrorAlert('Unable to load digital marketing team members. Please try again.');
      }
    });

    this.adminService.getAllContentCreatorMembers().subscribe({
      next: (response: any) => {
        this.contentCreators = response.data;
      },
      error: (error) => {
        console.error('Error loading content creators:', error);
        this.showErrorAlert('Unable to load content creator team members. Please try again.');
      }
    });
  }

  onSubmit(): void {
    if (this.taskForm.valid) {
      const formData = new FormData();
      const formValue = this.taskForm.value;

      const assignedTo = formValue.assignedTo.map((member: any) => ({
        id: member.id,
        role: member.role
      }));

      Object.keys(formValue).forEach(key => {
        if (key !== 'relatedDocs' && key !== 'assignedTo') {
          formData.append(key, formValue[key]);
        }
      });

      formData.append('assignedTo', JSON.stringify(assignedTo));

      const files: FileList = this.taskForm.get('relatedDocs')?.value;
      if (files) {
        Array.from(files).forEach(file => {
          formData.append('relatedDocs', file);
        });
      }

      this.isLoading = true;
      if (this.selectedTask) {
        this.adminService.updateMarketingTask(this.selectedTask._id, formData).subscribe({
          next: () => {
            this.loadMarketingTasks();
            this.resetForm();
            this.showSuccessAlert('Task updated successfully!');
          },
          error: (error) => {
            console.error('Error updating task:', error);
            this.isLoading = false;
            this.showErrorAlert('Error updating task. Please try again.');
          },
          complete: () => this.isLoading = false
        });
      } else {
        this.adminService.createMarketingTask(formData).subscribe({
          next: () => {
            this.loadMarketingTasks();
            this.resetForm();
            this.showSuccessAlert('Task created successfully!');
          },
          error: (error) => {
            console.error('Error creating task:', error);
            this.isLoading = false;
            this.showErrorAlert('Error creating task. Please try again.');
          },
          complete: () => this.isLoading = false
        });
      }
    }
  }

  editTask(task: any): void {
    this.selectedTask = task;
    this.showForm = true;
    
    // Convert dates to YYYY-MM-DD format for the date inputs
    const startDate = task.startDate ? task.startDate.split('T')[0] : '';
    const endDate = task.endDate ? task.endDate.split('T')[0] : '';
    
    // Correctly format the assignedTo array
    const assignedTo = task.assignedTo.map((member: any) => ({
      id: member.id._id || member.id, // Handle both populated and unpopulated cases
      role: member.role
    }));

    this.taskForm.patchValue({
      taskName: task.taskName,
      taskDescription: task.taskDescription,
      projectId: task.projectId._id || task.projectId,
      priority: task.priority,
      startDate: startDate,
      endDate: endDate,
      status: task.status,
      assignedTo: assignedTo
    });

    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  deleteTask(taskId: string): void {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.isLoading = true;
        this.adminService.deleteMarketingTask(taskId).subscribe({
          next: () => {
            this.loadMarketingTasks();
            this.isLoading = false;
            this.showSuccessAlert('Task deleted successfully!');
          },
          error: (error) => {
            console.error('Error deleting task:', error);
            this.isLoading = false;
            this.showErrorAlert('Error deleting task. Please try again.');
          }
        });
      }
    });
  }

  resetForm(): void {
    this.taskForm.reset({
      priority: 'medium',
      status: 'pending',
      assignedTo: []
    });
    this.selectedTask = null;
    this.showForm = false;
  }

  onFileSelect(event: Event): void {
    const element = event.target as HTMLInputElement;
    const fileList: FileList | null = element.files;
    if (fileList) {
      this.taskForm.patchValue({
        relatedDocs: fileList
      });
    }
  }

  onTeamMemberSelect(member: any, role: 'DigitalMarketingRole' | 'ContentCreator'): void {
    const currentAssignees = this.taskForm.get('assignedTo')?.value || [];
    const memberIndex = currentAssignees.findIndex((a: any) => a.id === member._id);

    if (memberIndex === -1) {
      // Add member with correct structure
      currentAssignees.push({
        id: member._id,
        role: role
      });
    } else {
      // Remove member
      currentAssignees.splice(memberIndex, 1);
    }

    this.taskForm.patchValue({ assignedTo: currentAssignees });
  }

  isTeamMemberSelected(memberId: string): boolean {
    const currentAssignees = this.taskForm.get('assignedTo')?.value || [];
    return currentAssignees.some((a: any) => a.id === memberId);
  }

  viewTask(task: any): void {
    this.selectedViewTask = task;
    this.showViewModal = true;
  }

  closeViewModal(): void {
    this.showViewModal = false;
    this.selectedViewTask = null;
  }

  ImageViewer(imageUrl: string) {
    Swal.fire({
      imageUrl,
      imageAlt: 'Task Image',
      width: '80%',
      confirmButtonText: 'Close'
    });
  }

  viewUpdates(taskId: string) {
    this.closeViewModal();
    this.router.navigate(['/admin/view-updates'], { 
      queryParams: { taskId: taskId }
    });
  }

  viewRevenue(): void {
    this.router.navigate(['/admin/market-revenue']);
  }
}
