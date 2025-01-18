import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdminService } from '../../services/admin.service';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogModule,
    MatSelectModule
  ],
  templateUrl: './clients.component.html',
  styleUrl: './clients.component.css'
})
export class ClientsComponent implements OnInit {
  clients: any[] = [];
  clientForm: FormGroup;
  displayedColumns: string[] = ['clientName', 'email', 'projects', 'actions'];
  isEditing: boolean = false;
  selectedClientId: string | null = null;
  isLoading = false;
  errorMessage: string | null = null;
  availableProjects: any[] = [];
  isProjectsDropdownOpen = false;
  projectSearchQuery = '';
  selectedProjects: string[] = [];

  constructor(
    private adminService: AdminService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.clientForm = this.fb.group({
      clientName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      projects: [[]]
    });
  }

  ngOnInit(): void {
    this.loadClients();
    this.loadProjects();
  }

  loadClients(): void {
    this.isLoading = true;
    this.errorMessage = null;
    
    this.adminService.getAllClients().subscribe({
      next: (response) => {
        this.clients = response.clients;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error.message;
        this.showMessage('Error loading clients: ' + error.message);
        this.isLoading = false;
      }
    });
  }

  loadProjects(): void {
    this.adminService.getAllProjects().subscribe({
      next: (response) => {
        this.availableProjects = response;
      },
      error: (error) => {
        this.showMessage('Error loading projects: ' + error.message);
      }
    });
  }

  onSubmit(): void {
    if (this.clientForm.valid) {
      if (this.isEditing && this.selectedClientId) {
        this.updateClient();
      } else {
        this.registerClient();
      }
    }
  }

  registerClient(): void {
    this.adminService.registerClient(this.clientForm.value).subscribe({
      next: () => {
        this.showMessage('Client registered successfully');
        this.loadClients();
        this.resetForm();
      },
      error: (error) => {
        this.showMessage('Error registering client: ' + error.message);
      }
    });
  }

  updateClient(): void {
    if (this.selectedClientId) {
      const clientData = {
        clientName: this.clientForm.get('clientName')?.value,
        email: this.clientForm.get('email')?.value,
        projects: this.clientForm.get('projects')?.value || []
      };
      
      this.adminService.updateClient(this.selectedClientId, clientData).subscribe({
        next: () => {
          this.showMessage('Client updated successfully');
          this.loadClients();
          this.resetForm();
        },
        error: (error) => {
          this.showMessage('Error updating client: ' + error.message);
        }
      });
    }
  }

  editClient(client: any): void {
    this.isEditing = true;
    this.selectedClientId = client._id;
    
    this.selectedProjects = client.projects?.map((p: any) => p._id) || [];
    
    this.clientForm.patchValue({
      clientName: client.clientName,
      email: client.email,
      password: '',
      projects: this.selectedProjects
    });
    
    this.clientForm.get('password')?.clearValidators();
    this.clientForm.get('password')?.setValidators(Validators.minLength(6));
    this.clientForm.get('password')?.updateValueAndValidity();
  }

  deleteClient(clientId: string): void {
    if (confirm('Are you sure you want to delete this client?')) {
      this.adminService.deleteClient(clientId).subscribe({
        next: () => {
          this.showMessage('Client deleted successfully');
          this.loadClients();
        },
        error: (error) => {
          this.showMessage('Error deleting client: ' + error.message);
        }
      });
    }
  }

  resetForm(): void {
    this.clientForm.reset();
    this.isEditing = false;
    this.selectedClientId = null;
    this.selectedProjects = [];
    this.projectSearchQuery = '';
    this.isProjectsDropdownOpen = false;
    
    this.clientForm.get('password')?.setValidators([
      Validators.required,
      Validators.minLength(6)
    ]);
    this.clientForm.get('password')?.updateValueAndValidity();
  }

  private showMessage(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    });
  }

  getErrorMessage(controlName: string): string {
    const control = this.clientForm.get(controlName);
    if (control?.hasError('required')) {
      return `${controlName.charAt(0).toUpperCase() + controlName.slice(1)} is required`;
    }
    if (control?.hasError('email')) {
      return 'Please enter a valid email address';
    }
    if (control?.hasError('minlength')) {
      return 'Password must be at least 6 characters';
    }
    return '';
  }

  ngAfterViewInit() {
    const style = document.createElement('style');
    style.innerHTML = `
      .mat-mdc-form-field {
        width: 100%;
      }
      .mat-mdc-select-panel {
        max-height: 250px !important;
      }
      .mat-mdc-option {
        font-size: 0.875rem !important;
      }
    `;
    document.head.appendChild(style);
  }

  toggleProjectsDropdown(): void {
    this.isProjectsDropdownOpen = !this.isProjectsDropdownOpen;
    
    if (this.isProjectsDropdownOpen) {
      setTimeout(() => {
        document.addEventListener('click', this.closeDropdown);
      });
    }
  }

  closeDropdown = (event: any): void => {
    const dropdown = document.querySelector('.dropdown-container');
    if (!dropdown?.contains(event.target)) {
      this.isProjectsDropdownOpen = false;
      document.removeEventListener('click', this.closeDropdown);
    }
  }

  get filteredProjects(): any[] {
    return this.availableProjects.filter(project => 
      project.title.toLowerCase().includes(this.projectSearchQuery.toLowerCase())
    );
  }

  toggleProjectSelection(projectId: string): void {
    const index = this.selectedProjects.indexOf(projectId);
    if (index === -1) {
      this.selectedProjects.push(projectId);
    } else {
      this.selectedProjects.splice(index, 1);
    }
    this.clientForm.patchValue({ projects: this.selectedProjects });
  }

  isProjectSelected(projectId: string): boolean {
    return this.selectedProjects.includes(projectId);
  }

  getProjectTitle(projectId: string): string {
    const project = this.availableProjects.find(p => p._id === projectId);
    return project ? project.title : '';
  }

  getSelectedProjectsText(): string {
    if (this.selectedProjects.length === 0) {
      return 'Select projects';
    }
    if (this.selectedProjects.length === 1) {
      return this.getProjectTitle(this.selectedProjects[0]);
    }
    return `${this.selectedProjects.length} projects selected`;
  }
}
