import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MarketerService } from '../../services/marketer.services';
import { LoaderService } from '../../services/loader.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  profile = {
    username: '',
    email: '',
    skills: [] as string[],
    image: ''
  };
  newSkill: string = '';
  errorMessage: string = '';
  successMessage: string = '';
  selectedFile: File | null = null;

  constructor(
    private marketerService: MarketerService,
    private loaderService: LoaderService
  ) {}

  ngOnInit() {
    this.loadProfile();
  }

  loadProfile() {
    this.loaderService.show();
    this.marketerService.getProfile().subscribe({
      next: (response) => {
        this.profile = response.data;
        this.loaderService.hide();
      },
      error: (error) => {
        this.errorMessage = 'Error loading profile';
        console.error('Profile loading error:', error);
        this.loaderService.hide();
      }
    });
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  addSkill() {
    if (this.newSkill && !this.profile.skills.includes(this.newSkill)) {
      this.profile.skills.push(this.newSkill);
      this.newSkill = '';
    }
  }

  removeSkill(skill: string) {
    this.profile.skills = this.profile.skills.filter(s => s !== skill);
  }

  onSubmit() {
    this.loaderService.show();
    const formData = new FormData();
    formData.append('username', this.profile.username);
    formData.append('email', this.profile.email);
    formData.append('skills', JSON.stringify(this.profile.skills));
    
    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }

    this.marketerService.updateProfile(formData).subscribe({
      next: (response) => {
        this.successMessage = 'Profile updated successfully';
        this.profile = response.data;
        this.selectedFile = null;
        this.loaderService.hide();
      },
      error: (error) => {
        this.errorMessage = 'Error updating profile';
        console.error('Profile update error:', error);
        this.loaderService.hide();
      }
    });
  }

  deleteAccount() {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      this.loaderService.show();
      this.marketerService.deleteProfile().subscribe({
        next: () => {
          localStorage.clear();
          window.location.href = '/marketer/login';
          this.loaderService.hide();
        },
        error: (error) => {
          this.errorMessage = 'Error deleting account';
          console.error('Account deletion error:', error);
          this.loaderService.hide();
        }
      });
    }
  }
}
