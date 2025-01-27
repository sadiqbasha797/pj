import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CreatorService } from '../../services/creator.service';
import { LoaderService } from '../../services/loader.service';

@Component({
  selector: 'app-profile-creator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile-creator.component.html',
  styleUrl: './profile-creator.component.css'
})
export class ProfileCreatorComponent implements OnInit {
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
    private creatorService: CreatorService,
    private loaderService: LoaderService
  ) {}

  ngOnInit() {
    this.loadProfile();
  }

  loadProfile() {
    this.loaderService.show();
    this.creatorService.getProfile().subscribe({
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

    this.creatorService.updateProfile(formData).subscribe({
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
      this.creatorService.deleteProfile().subscribe({
        next: () => {
          localStorage.clear();
          window.location.href = '/creator/login';
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
