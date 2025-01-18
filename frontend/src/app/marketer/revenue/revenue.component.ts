import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MarketerService } from '../../services/marketer.services';

@Component({
  selector: 'app-revenue',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './revenue.component.html',
  styleUrl: './revenue.component.css'
})
export class RevenueComponent implements OnInit {
  revenueForm: FormGroup;
  revenues: any[] = [];
  isLoading = false;
  selectedFile: File | null = null;
  projects: any[] = [];
  userId: string;
  editingRevenue: any = null;
  filterForm: FormGroup;
  filteredRevenues: any[] = [];
  showRevenueModal = false;

  constructor(
    private fb: FormBuilder,
    private marketerService: MarketerService
  ) {
    this.revenueForm = this.fb.group({
      projectId: [''],
      revenueGenerated: ['', [Validators.required, Validators.min(0)]],
      description: ['', Validators.required],
    });
    this.userId = localStorage.getItem('userId') || '';

    this.filterForm = this.fb.group({
      projectId: [''],
      dateFrom: [''],
      dateTo: [''],
      amountFrom: [''],
      amountTo: ['']
    });

    this.filterForm.valueChanges.subscribe(() => {
      this.applyFilters();
    });
  }

  ngOnInit() {
    this.loadProjects();
    this.loadRevenue();
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  loadRevenue() {
    this.isLoading = true;
    this.marketerService.getAllRevenue().subscribe({
      next: (response) => {
        this.revenues = response.data.filter((revenue: { createdBy: { id: string; }; }) => 
          revenue.createdBy.id === this.userId
        );
        this.filteredRevenues = [...this.revenues];
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading revenues:', error);
        this.isLoading = false;
      }
    });
  }

  editRevenue(revenue: any) {
    this.editingRevenue = revenue;
    this.revenueForm.patchValue({
      projectId: revenue.projectId?._id || '',
      revenueGenerated: revenue.revenueGenerated,
      description: revenue.description
    });
  }

  cancelEdit() {
    this.editingRevenue = null;
    this.revenueForm.reset();
    this.selectedFile = null;
    this.showRevenueModal = false;
  }

  onSubmit() {
    if (this.revenueForm.valid) {
      const formData = new FormData();
      Object.keys(this.revenueForm.value).forEach(key => {
        formData.append(key, this.revenueForm.value[key]);
      });
      
      if (this.selectedFile) {
        formData.append('attachments', this.selectedFile);
      }

      if (this.editingRevenue) {
        this.marketerService.updateRevenue(this.editingRevenue._id, formData).subscribe({
          next: () => {
            this.revenueForm.reset();
            this.selectedFile = null;
            this.editingRevenue = null;
            this.showRevenueModal = false;
            this.loadRevenue();
          },
          error: (error) => console.error('Error updating revenue:', error)
        });
      } else {
        this.marketerService.createRevenue(formData).subscribe({
          next: () => {
            this.revenueForm.reset();
            this.selectedFile = null;
            this.showRevenueModal = false;
            this.loadRevenue();
          },
          error: (error) => console.error('Error creating revenue:', error)
        });
      }
    }
  }

  deleteRevenue(revenueId: string) {
    if (confirm('Are you sure you want to delete this revenue entry?')) {
      this.marketerService.deleteRevenue(revenueId).subscribe({
        next: () => this.loadRevenue(),
        error: (error) => console.error('Error deleting revenue:', error)
      });
    }
  }

  loadProjects() {
    this.marketerService.getProjects().subscribe({
      next: (projects) => {
        this.projects = projects;
      },
      error: (error) => {
        console.error('Error loading projects:', error);
      }
    });
  }

  applyFilters() {
    const filters = this.filterForm.value;
    
    this.filteredRevenues = this.revenues.filter(revenue => {
      let matchesFilters = true;

      if (filters.projectId) {
        matchesFilters = matchesFilters && revenue.projectId?._id === filters.projectId;
      }

      if (filters.dateFrom) {
        matchesFilters = matchesFilters && 
          new Date(revenue.date) >= new Date(filters.dateFrom);
      }
      if (filters.dateTo) {
        matchesFilters = matchesFilters && 
          new Date(revenue.date) <= new Date(filters.dateTo);
      }

      if (filters.amountFrom) {
        matchesFilters = matchesFilters && 
          revenue.revenueGenerated >= parseFloat(filters.amountFrom);
      }
      if (filters.amountTo) {
        matchesFilters = matchesFilters && 
          revenue.revenueGenerated <= parseFloat(filters.amountTo);
      }

      return matchesFilters;
    });
  }

  clearFilters() {
    this.filterForm.reset();
    this.filteredRevenues = [...this.revenues];
  }

  toggleRevenueModal() {
    this.showRevenueModal = !this.showRevenueModal;
    if (!this.showRevenueModal) {
      this.cancelEdit();
    }
  }
}
