import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

interface AdminProfile {
  _id: string;
  username: string;
  email: string;
  role: string;
  address: string;
  mobile: string;
  profileImage: string;
  socialLinks: {
    instagram: string;
    twitter: string;
    linkedin: string;
    facebook: string;
  };
  companyDetails: {
    socialLinks: {
      instagram: string;
      twitter: string;
      linkedin: string;
      facebook: string;
    };
    achievements: string[];
    logo: string;
    name: string;
    address: string;
    established: string;
  };
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
getSocialIcon(_t108: string) {
throw new Error('Method not implemented.');
}
  profile: AdminProfile | null = null;
  isEditing = false;
  editedProfile: Partial<AdminProfile> = {};
  selectedProfileImage: File | null = null;
  selectedCompanyLogo: File | null = null;

  constructor(
    private adminService: AdminService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadProfile();
  }

  loadProfile() {
    this.adminService.getProfile().subscribe({
      next: (data) => {
        this.profile = data;
        this.editedProfile = { ...data };
      },
      error: (error) => {
        console.error('Error loading profile:', error);
      }
    });
  }

  onProfileImageChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedProfileImage = file;
      // Preview image
      const reader = new FileReader();
      reader.onload = (e: any) => {
        if (this.editedProfile) {
          this.editedProfile.profileImage = e.target.result;
        }
      };
      reader.readAsDataURL(file);
    }
  }

  onCompanyLogoChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedCompanyLogo = file;
      // Preview image
      const reader = new FileReader();
      reader.onload = (e: any) => {
        if (this.editedProfile?.companyDetails) {
          this.editedProfile.companyDetails.logo = e.target.result;
        }
      };
      reader.readAsDataURL(file);
    }
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
    if (!this.isEditing) {
      this.editedProfile = { ...this.profile };
    }
  }

  async saveProfile() {
    if (!this.editedProfile) return;

    // First handle media updates if any files are selected
    if (this.selectedProfileImage || this.selectedCompanyLogo) {
      await this.handleMediaUpdates();
    }
    
    // Then update the profile data
    const profileData = {
      username: this.editedProfile.username,
      email: this.editedProfile.email,
      mobile: this.editedProfile.mobile,
      address: this.editedProfile.address,
      socialLinks: this.editedProfile.socialLinks,
      companyDetails: {
        name: this.editedProfile.companyDetails?.name,
        address: this.editedProfile.companyDetails?.address,
        established: this.editedProfile.companyDetails?.established,
        socialLinks: this.editedProfile.companyDetails?.socialLinks,
        achievements: this.editedProfile.companyDetails?.achievements
      }
    };

    this.adminService.updateProfile(profileData).subscribe({
      next: (response) => {
        this.profile = response.admin;
        this.isEditing = false;
        Swal.fire({
          title: 'Success!',
          text: 'Profile updated successfully!',
          icon: 'success',
          confirmButtonText: 'OK'
        });
      },
      error: (error) => {
        console.error('Error updating profile:', error);
        Swal.fire({
          title: 'Error!',
          text: 'Error updating profile. Please try again.',
          icon: 'error',
          confirmButtonText: 'OK'
        });
      }
    });
  }

  private async handleMediaUpdates(): Promise<void> {
    const formData = new FormData();
    
    if (this.selectedProfileImage) {
      formData.append('profileImage', this.selectedProfileImage);
    }
    
    if (this.selectedCompanyLogo) {
      formData.append('companyLogo', this.selectedCompanyLogo);
    }

    try {
      const response = await this.adminService.updateAdminMedia(formData).toPromise();
      // Update the profile with new media URLs
      if (response.admin) {
        if (this.selectedProfileImage) {
          this.editedProfile.profileImage = response.admin.profileImage;
        }
        if (this.selectedCompanyLogo && this.editedProfile.companyDetails) {
          this.editedProfile.companyDetails.logo = response.admin.companyDetails.logo;
        }
      }
      this.selectedProfileImage = null;
      this.selectedCompanyLogo = null;
      
      Swal.fire({
        title: 'Success!',
        text: 'Media files updated successfully!',
        icon: 'success',
        confirmButtonText: 'OK'
      });
    } catch (error) {
      console.error('Error updating media:', error);
      Swal.fire({
        title: 'Error!',
        text: 'Error updating media files. Please try again.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
      throw error; // Re-throw to handle in saveProfile
    }
  }

  deleteProfile() {
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
        this.adminService.deleteProfile().subscribe({
          next: () => {
            this.showSuccessAlert('Profile deleted successfully!');
            localStorage.removeItem('adminToken');
            this.router.navigate(['/admin/login']);
          },
          error: (error) => {
            console.error('Error deleting profile:', error);
            this.showErrorAlert('Error deleting profile. Please try again.');
          }
        });
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
