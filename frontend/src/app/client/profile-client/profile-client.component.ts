import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClientService } from '../../services/client.service';

@Component({
  selector: 'app-profile-client',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile-client.component.html',
  styleUrl: './profile-client.component.css'
})
export class ProfileClientComponent implements OnInit {
  client: any = {};
  isEditing = false;
  editForm: any = {};
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  selectedFile: File | null = null;
  previewUrl: string | null = null;

  constructor(private clientService: ClientService) {}

  ngOnInit() {
    this.loadClientProfile();
  }

  loadClientProfile() {
    this.isLoading = true;
    this.clientService.getProfile().subscribe({
      next: (response) => {
        this.client = response.client;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error.message || 'Error loading profile';
        this.isLoading = false;
      }
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      // Create preview URL
      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  startEditing() {
    this.editForm = { ...this.client };
    this.isEditing = true;
    this.previewUrl = null;
    this.selectedFile = null;
  }

  cancelEditing() {
    this.isEditing = false;
    this.editForm = {};
    this.previewUrl = null;
    this.selectedFile = null;
  }

  saveProfile() {
    this.isLoading = true;
    
    // Create FormData object to handle file upload
    const formData = new FormData();
    
    // Handle each form field separately
    const fieldsToUpdate = [
      'clientName',
      'email',
      'companyName',
      'address',
      'countryCode',
      'mobileNumber'
    ];

    // Add basic fields to FormData
    fieldsToUpdate.forEach(field => {
      if (this.editForm[field]) {
        formData.append(field, this.editForm[field]);
      }
    });
    
    // Add file if selected
    if (this.selectedFile) {
      formData.append('companyLogo', this.selectedFile);
    }

    this.clientService.updateProfile(this.client._id, formData).subscribe({
      next: (response) => {
        this.client = response.client;
        this.isEditing = false;
        this.successMessage = 'Profile updated successfully';
        this.isLoading = false;
        this.selectedFile = null;
        this.previewUrl = null;
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (error) => {
        this.errorMessage = error.message || 'Error updating profile';
        this.isLoading = false;
        setTimeout(() => this.errorMessage = '', 3000);
      }
    });
  }
}
