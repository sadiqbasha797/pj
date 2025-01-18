import { Component, OnInit } from '@angular/core';
import { DeveloperService } from '../../services/developer.service';
import { NgModel } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DatePipe } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-profile-developer',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule],
  templateUrl: './profile-developer.component.html',
  styleUrls: ['./profile-developer.component.css'],
  providers: [DatePipe]
})
export class ProfileDeveloperComponent implements OnInit {
  developer: any;
  manager: any;
  isEditing = false;
  editedProfile: any = {};
  selectedImage: File | null = null;

  constructor(
    private developerService: DeveloperService,
    private datePipe: DatePipe
  ) {}

  ngOnInit() {
    this.fetchProfile();
  }

  fetchProfile() {
    this.developerService.getProfile().subscribe({
      next: (response) => {
        this.developer = response.developer;
        this.manager = response.manager;
        this.editedProfile = { ...response.developer };
      },
      error: (error) => {
        console.error('Error fetching developer profile:', error);
        this.showErrorAlert('Error fetching profile');
      }
    });
  }

  onImageSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedImage = file;
      // Preview image
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.editedProfile.image = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
    if (!this.isEditing) {
      this.editedProfile = { ...this.developer };
      this.selectedImage = null;
    }
  }

  async updateProfile() {
    const formData = new FormData();
    
    if (this.selectedImage) {
      formData.append('image', this.selectedImage);
    }
    
    if (this.editedProfile.username !== this.developer.username) {
      formData.append('username', this.editedProfile.username);
    }
    
    if (this.editedProfile.skills !== this.developer.skills) {
      formData.append('skills', this.editedProfile.skills);
    }

    this.developerService.updateProfile(formData).subscribe({
      next: (response) => {
        this.developer = response.developer;
        this.isEditing = false;
        this.showSuccessAlert('Profile updated successfully!');
        this.fetchProfile();
      },
      error: (error) => {
        console.error('Error updating profile:', error);
        this.showErrorAlert('Error updating profile');
      }
    });
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
}
