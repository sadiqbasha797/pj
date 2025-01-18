import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ManagerService } from '../../services/manager.service';

@Component({
  selector: 'app-profile-manager',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile-manager.component.html',
  styleUrl: './profile-manager.component.css'
})
export class ProfileManagerComponent implements OnInit {
  profile: any = {
    image: 'assets/default-avatar.png' // Default image path
  };
  isEditing = false;
  editableProfile: any = {};

  constructor(private managerService: ManagerService) {}

  ngOnInit() {
    this.loadProfile();
  }

  loadProfile() {
    this.managerService.getManagerProfile().subscribe({
      next: (data) => {
        this.profile = data;
      },
      error: (error) => {
        console.error('Error loading profile:', error);
      }
    });
  }

  startEditing() {
    this.editableProfile = { ...this.profile };
    this.isEditing = true;
  }

  cancelEditing() {
    this.isEditing = false;
    this.editableProfile = {};
  }

  saveProfile() {
    this.managerService.updateProfile(this.editableProfile).subscribe({
      next: (updatedProfile) => {
        this.profile = updatedProfile;
        this.isEditing = false;
        this.editableProfile = {};
      },
      error: (error) => {
        console.error('Error updating profile:', error);
      }
    });
  }
}
