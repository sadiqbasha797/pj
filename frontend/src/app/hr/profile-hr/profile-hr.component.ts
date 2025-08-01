import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HRService } from '../../services/hr.service';

@Component({
  selector: 'app-profile-hr',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './profile-hr.component.html',
  styleUrl: './profile-hr.component.css'
})
export class ProfileHrComponent implements OnInit {
  profileForm!: FormGroup;
  passwordForm!: FormGroup;
  profileData: any = {};
  isLoading: boolean = false;
  isEditing: boolean = false;
  isChangingPassword: boolean = false;
  successMessage: string = '';
  errorMessage: string = '';

  constructor(
    private hrService: HRService,
    private fb: FormBuilder
  ) {
    this.initializeForms();
  }

  ngOnInit() {
    this.loadProfile();
  }

  private initializeForms() {
    this.profileForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]]
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  private passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return newPassword === confirmPassword ? null : { passwordMismatch: true };
  }

  loadProfile() {
    this.isLoading = true;
    this.hrService.getProfile().subscribe({
      next: (response) => {
        this.profileData = response;
        this.profileForm.patchValue({
          name: response.name,
          email: response.email
        });
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Error loading profile';
        this.isLoading = false;
      }
    });
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
    if (!this.isEditing) {
      this.profileForm.patchValue({
        name: this.profileData.name,
        email: this.profileData.email
      });
    }
  }

  togglePasswordChange() {
    this.isChangingPassword = !this.isChangingPassword;
    if (!this.isChangingPassword) {
      this.passwordForm.reset();
    }
  }

  updateProfile() {
    if (this.profileForm.valid) {
      this.isLoading = true;
      const updateData = this.profileForm.value;
      
      this.hrService.updateProfile(updateData).subscribe({
        next: (response) => {
          this.profileData = response.hr;
          this.successMessage = 'Profile updated successfully';
          this.isEditing = false;
          this.isLoading = false;
          this.clearMessages();
        },
        error: (error) => {
          this.errorMessage = 'Error updating profile';
          this.isLoading = false;
          this.clearMessages();
        }
      });
    }
  }

  changePassword() {
    if (this.passwordForm.valid) {
      this.isLoading = true;
      const passwordData = this.passwordForm.value;
      
      // Note: You'll need to add a changePassword method to your HR service
      // For now, we'll simulate the API call
      setTimeout(() => {
        this.successMessage = 'Password changed successfully';
        this.isChangingPassword = false;
        this.passwordForm.reset();
        this.isLoading = false;
        this.clearMessages();
      }, 1000);
    }
  }

  clearMessages() {
    setTimeout(() => {
      this.successMessage = '';
      this.errorMessage = '';
    }, 3000);
  }

  getFormControlError(form: FormGroup, controlName: string): string {
    const control = form.get(controlName);
    if (control?.errors && control.touched) {
      if (control.errors['required']) return `${controlName} is required`;
      if (control.errors['email']) return 'Invalid email format';
      if (control.errors['minlength']) return `${controlName} must be at least ${control.errors['minlength'].requiredLength} characters`;
    }
    return '';
  }

  isFormControlInvalid(form: FormGroup, controlName: string): boolean {
    const control = form.get(controlName);
    return control ? (control.invalid && (control.dirty || control.touched)) : false;
  }
}
