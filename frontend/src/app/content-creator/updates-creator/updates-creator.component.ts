import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CreatorService } from '../../services/creator.service';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormArray, Validators } from '@angular/forms';

interface LeadInfo {
  name: string;
  description: string;
  contact: string;
  email: string;
  _id: string;
}

interface Comment {
  text: string;
  createdBy: string;
  name: string;
  role: string;
  createdAt: string;
  _id: string;
}

interface TaskUpdate {
  _id: string;
  taskId: {
    _id: string;
    taskName: string;
    taskDescription: string;
    priority: 'high' | 'medium' | 'low';
    status: 'in-progress' | 'completed' | 'pending';
  };
  description: string;
  startDate: string;
  endDate: string;
  attachments: string[];
  leadsInfo: LeadInfo[];
  comments: Comment[];
  updatedBy: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

@Component({
  selector: 'app-updates-creator',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './updates-creator.component.html',
  styleUrl: './updates-creator.component.css'
})
export class UpdatesCreatorComponent implements OnInit {
  updates: TaskUpdate[] = [];
  filteredUpdates: TaskUpdate[] = [];
  loading = true;
  errorMessage = '';
  taskId: string | null = null;
  taskName: string = '';
  filterForm: FormGroup;
  showLeadsTable = false;
  currentUserId: string = '';
  showAddUpdateModal = false;
  updateForm: FormGroup;
  isSubmitting = false;
  selectedFiles: File[] = [];
  showEditModal = false;
  editingUpdate: TaskUpdate | null = null;
  priorities: string[] = ['high', 'medium', 'low'];
  statuses: string[] = ['in-progress', 'completed', 'pending'];

  constructor(
    private creatorService: CreatorService,
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder
  ) {
    this.filterForm = this.fb.group({
      search: [''],
      startDate: [''],
      endDate: [''],
      priority: [''],
      status: ['']
    });

    this.updateForm = this.fb.group({
      description: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      leadsInfo: this.fb.array([])
    });

    this.currentUserId = localStorage.getItem('userId') || '';
    
    this.filterForm.valueChanges.subscribe(() => {
      this.applyFilters();
    });
  }

  get leadsInfoArray() {
    return this.updateForm.get('leadsInfo') as FormArray;
  }

  createLeadFormGroup() {
    return this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      contact: ['', Validators.required],
      description: ['']
    });
  }

  addLead() {
    this.leadsInfoArray.push(this.createLeadFormGroup());
  }

  removeLead(index: number) {
    this.leadsInfoArray.removeAt(index);
  }

  openAddUpdateModal() {
    this.showAddUpdateModal = true;
    this.updateForm.reset();
    this.leadsInfoArray.clear();
    this.selectedFiles = [];
  }

  closeAddUpdateModal() {
    this.showAddUpdateModal = false;
  }

  onFileSelect(event: any) {
    if (event.target.files.length > 0) {
      this.selectedFiles = Array.from(event.target.files);
    }
  }

  removeFile(index: number) {
    this.selectedFiles = this.selectedFiles.filter((_, i) => i !== index);
  }

  async submitUpdate() {
    if (this.updateForm.valid && !this.isSubmitting && this.taskId) {
      this.isSubmitting = true;

      const formData = new FormData();
      formData.append('taskId', this.taskId);
      formData.append('description', this.updateForm.get('description')?.value);
      formData.append('startDate', this.updateForm.get('startDate')?.value);
      formData.append('endDate', this.updateForm.get('endDate')?.value);
      formData.append('leadsInfo', JSON.stringify(this.updateForm.get('leadsInfo')?.value));

      this.selectedFiles.forEach((file) => {
        formData.append('attachments', file);
      });

      try {
        await this.creatorService.createTaskUpdate(formData).toPromise();
        this.closeAddUpdateModal();
        this.loadUpdates(this.taskId);
      } catch (error) {
        console.error('Error creating task update:', error);
      } finally {
        this.isSubmitting = false;
      }
    }
  }

  openEditModal(update: TaskUpdate) {
    this.editingUpdate = update;
    this.showEditModal = true;
    
    this.updateForm.patchValue({
      description: update.description,
      startDate: update.startDate.split('T')[0],
      endDate: update.endDate.split('T')[0],
    });

    this.leadsInfoArray.clear();
    update.leadsInfo.forEach(lead => {
      this.leadsInfoArray.push(this.fb.group({
        name: [lead.name, Validators.required],
        email: [lead.email, [Validators.required, Validators.email]],
        contact: [lead.contact, Validators.required],
        description: [lead.description]
      }));
    });

    this.selectedFiles = [];
  }

  closeEditModal() {
    this.showEditModal = false;
    this.editingUpdate = null;
    this.updateForm.reset();
    this.leadsInfoArray.clear();
    this.selectedFiles = [];
  }

  async submitEdit() {
    if (this.updateForm.valid && !this.isSubmitting && this.editingUpdate && this.taskId) {
      this.isSubmitting = true;

      const formData = new FormData();
      formData.append('description', this.updateForm.get('description')?.value);
      formData.append('startDate', this.updateForm.get('startDate')?.value);
      formData.append('endDate', this.updateForm.get('endDate')?.value);
      formData.append('leadsInfo', JSON.stringify(this.updateForm.get('leadsInfo')?.value));

      this.selectedFiles.forEach((file) => {
        formData.append('attachments', file);
      });

      try {
        await this.creatorService.updateTaskUpdate(this.editingUpdate._id, formData).toPromise();
        this.closeEditModal();
        this.loadUpdates(this.taskId);
      } catch (error) {
        console.error('Error updating task update:', error);
      } finally {
        this.isSubmitting = false;
      }
    }
  }

  async deleteUpdate(updateId: string) {
    if (confirm('Are you sure you want to delete this update? This action cannot be undone.')) {
      try {
        await this.creatorService.deleteTaskUpdate(updateId).toPromise();
        if (this.taskId) {
          this.loadUpdates(this.taskId);
        }
      } catch (error) {
        console.error('Error deleting task update:', error);
      }
    }
  }

  applyFilters() {
    let filtered = [...this.updates];
    const filters = this.filterForm.value;

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(update => 
        update.description.toLowerCase().includes(searchTerm) ||
        update.taskId.taskName.toLowerCase().includes(searchTerm) ||
        update.updatedBy.name.toLowerCase().includes(searchTerm)
      );
    }

    if (filters.startDate) {
      filtered = filtered.filter(update => 
        new Date(update.startDate) >= new Date(filters.startDate)
      );
    }

    if (filters.endDate) {
      filtered = filtered.filter(update => 
        new Date(update.endDate) <= new Date(filters.endDate)
      );
    }

    if (filters.priority) {
      filtered = filtered.filter(update => 
        update.taskId.priority === filters.priority
      );
    }

    if (filters.status) {
      filtered = filtered.filter(update => 
        update.taskId.status === filters.status
      );
    }

    this.filteredUpdates = filtered;
  }

  toggleLeadsTable() {
    this.showLeadsTable = !this.showLeadsTable;
  }

  getAllLeads() {
    const allLeads: any[] = [];
    this.filteredUpdates.forEach(update => {
      update.leadsInfo.forEach(lead => {
        allLeads.push({
          taskName: update.taskId.taskName,
          name: lead.name,
          email: lead.email,
          contact: lead.contact,
          description: lead.description,
          addedOn: update.createdAt
        });
      });
    });
    return allLeads;
  }

  ngOnInit() {
    if (!this.creatorService.isLoggedIn()) {
      this.router.navigate(['/content-creator/login']);
      return;
    }

    this.route.queryParams.subscribe(params => {
      this.taskId = params['taskId'];
      if (this.taskId) {
        this.loadUpdates(this.taskId);
      } else {
        this.errorMessage = 'No task specified';
        this.loading = false;
      }
    });
  }

  loadUpdates(taskId: string) {
    this.creatorService.getTaskUpdates(taskId).subscribe({
      next: (response) => {
        console.log('Current User ID:', this.currentUserId);
        console.log('Updates received:', response);
        
        // Filter updates for current user
        this.updates = response.filter((update: TaskUpdate) => {
          console.log('Comparing:', update.updatedBy.id, this.currentUserId);
          return update.updatedBy.id === this.currentUserId;
        });
        
        console.log('Filtered Updates:', this.updates);
        
        if (this.updates.length > 0) {
          this.taskName = this.updates[0].taskId.taskName;
        }
        this.filteredUpdates = [...this.updates];
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading updates:', error);
        this.errorMessage = error.error?.message || 'Failed to load updates';
        this.loading = false;
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

  openAttachment(url: string) {
    window.open(url, '_blank');
  }

  goBack() {
    this.router.navigate(['/content-creator/tasks']);
  }
}
