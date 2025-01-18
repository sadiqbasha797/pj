import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MarketerService } from '../../services/marketer.services';
import { LoaderService } from '../../services/loader.service';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
interface LeadInfo {
  name: string;
  description: string;
  contact: string;
  email: string;
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
  comments: any[];
  updatedBy: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

@Component({
  selector: 'app-task-updates',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './task-updates.component.html',
  styleUrl: './task-updates.component.css'
})
export class TaskUpdatesComponent implements OnInit {
  taskUpdates: TaskUpdate[] = [];
  currentUserId: string = '';
  taskId: string = '';
  loading: boolean = false;
  error: string = '';
  showAddUpdateModal = false;
  updateForm: FormGroup;
  isSubmitting = false;
  selectedFiles: File[] = [];
  showEditModal = false;
  editingUpdate: TaskUpdate | null = {
    _id: '',
    taskId: {
      _id: '',
      taskName: '',
      taskDescription: '',
      priority: 'low',
      status: 'pending'
    },
    description: '',
    startDate: '',
    endDate: '',
    attachments: [],
    leadsInfo: [],
    comments: [],
    updatedBy: {
      id: '',
      name: ''
    },
    createdAt: '',
    updatedAt: '',
  };
  filterForm: FormGroup;
  filteredTaskUpdates: TaskUpdate[] = [];
  priorities: string[] = ['high', 'medium', 'low'];
  statuses: string[] = ['in-progress', 'completed', 'pending'];
  showLeadsTable: boolean = false;

  constructor(
    private marketerService: MarketerService,
    private loaderService: LoaderService,
    private route: ActivatedRoute,
    private fb: FormBuilder
  ) {
    const userData = localStorage.getItem('marketerUser');
    if (userData) {
      this.currentUserId = JSON.parse(userData)._id;
    }

    this.updateForm = this.fb.group({
      description: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      leadsInfo: this.fb.array([])
    });

    this.filterForm = this.fb.group({
      search: [''],
      startDate: [''],
      endDate: [''],
      priority: [''],
      status: ['']
    });

    this.filterForm.valueChanges.subscribe(() => {
      this.applyFilters();
    });
  }

  get leadsInfoArray() {
    return this.updateForm.get('leadsInfo') as FormArray;
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

  onFileSelect(event: any) {
    if (event.target.files.length > 0) {
      this.selectedFiles = Array.from(event.target.files);
    }
  }

  async submitUpdate() {
    if (this.updateForm.valid && !this.isSubmitting) {
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
        await this.marketerService.createTaskUpdate(formData).toPromise();
        this.closeAddUpdateModal();
        this.loadTaskUpdates(); // Refresh the updates list
      } catch (error) {
        console.error('Error creating task update:', error);
        // Handle error (show error message to user)
      } finally {
        this.isSubmitting = false;
      }
    }
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.taskId = params['taskId'];
      if (this.taskId) {
        this.loadTaskUpdates();
      } else {
        this.error = 'No task ID provided';
      }
    });
  }

  loadTaskUpdates() {
    this.loading = true;
    this.loaderService.show();
    this.marketerService.getTaskUpdates(this.taskId).subscribe({
      next: (response) => {
        this.taskUpdates = response;
        this.filteredTaskUpdates = response; // Initialize filtered results
        this.applyFilters(); // Apply any existing filters
        this.loading = false;
        this.loaderService.hide();
      },
      error: (error) => {
        console.error('Error loading task updates:', error);
        this.error = 'Failed to load task updates';
        this.loading = false;
        this.loaderService.hide();
      }
    });
  }

  removeFile(index: number): void {
    this.selectedFiles = this.selectedFiles.filter((_, i) => i !== index);
  }

  openEditModal(update: TaskUpdate) {
    this.editingUpdate = update;
    this.showEditModal = true;
    
    // Populate the form with existing data
    this.updateForm.patchValue({
      description: update.description,
      startDate: update.startDate.split('T')[0], // Format date for input
      endDate: update.endDate.split('T')[0],
    });

    // Clear and repopulate leads info
    this.leadsInfoArray.clear();
    update.leadsInfo.forEach(lead => {
      this.leadsInfoArray.push(this.fb.group({
        name: [lead.name, Validators.required],
        email: [lead.email, [Validators.required, Validators.email]],
        contact: [lead.contact, Validators.required],
        description: [lead.description]
      }));
    });

    // Reset selected files but keep track of existing attachments
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
    if (this.updateForm.valid && !this.isSubmitting && this.editingUpdate) {
      this.isSubmitting = true;

      const formData = new FormData();
      formData.append('description', this.updateForm.get('description')?.value);
      formData.append('startDate', this.updateForm.get('startDate')?.value);
      formData.append('endDate', this.updateForm.get('endDate')?.value);
      formData.append('leadsInfo', JSON.stringify(this.updateForm.get('leadsInfo')?.value));

      // Append new files
      this.selectedFiles.forEach((file) => {
        formData.append('attachments', file);
      });

      try {
        await this.marketerService.updateTaskUpdate(this.editingUpdate._id, formData).toPromise();
        this.closeEditModal();
        this.loadTaskUpdates(); // Refresh the list
      } catch (error) {
        console.error('Error updating task update:', error);
        // Handle error (show error message to user)
      } finally {
        this.isSubmitting = false;
      }
    }
  }

  async deleteUpdate(updateId: string) {
    if (confirm('Are you sure you want to delete this update? This action cannot be undone.')) {
      try {
        await this.marketerService.deleteTaskUpdate(updateId).toPromise();
        this.loadTaskUpdates(); // Refresh the list
      } catch (error) {
        console.error('Error deleting task update:', error);
        // Handle error (show error message to user)
      }
    }
  }

  applyFilters() {
    let filtered = [...this.taskUpdates];
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

    this.filteredTaskUpdates = filtered;
  }

  get activeFilters() {
    const filters = [];
    const values = this.filterForm.value;
    
    if (values.search) {
      filters.push({ key: 'search', label: 'Search', value: values.search });
    }
    if (values.startDate) {
      filters.push({ key: 'startDate', label: 'From', value: new Date(values.startDate).toLocaleDateString() });
    }
    if (values.endDate) {
      filters.push({ key: 'endDate', label: 'To', value: new Date(values.endDate).toLocaleDateString() });
    }
    if (values.priority) {
      filters.push({ key: 'priority', label: 'Priority', value: values.priority });
    }
    if (values.status) {
      filters.push({ key: 'status', label: 'Status', value: values.status });
    }
    
    return filters;
  }

  removeFilter(key: string) {
    this.filterForm.patchValue({ [key]: '' });
  }

  resetFilters() {
    this.filterForm.reset();
  }

  toggleLeadsTable() {
    this.showLeadsTable = !this.showLeadsTable;
  }

  getAllLeads() {
    const allLeads: any[] = [];
    this.filteredTaskUpdates.forEach(update => {
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
}
