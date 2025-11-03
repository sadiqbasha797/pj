import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LoaderService } from '../../services/loader.service';
import { AdminService } from '../../services/admin.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  errorMessage: string = '';

  // Reset password state
  showReset: boolean = false;
  resetEmail: string = '';
  resetOtp: string = '';
  resetNewPassword: string = '';
  resetStep: number = 1; // 1: enter email, 2: enter otp+new password
  resetMessage: string = '';
  resetError: string = '';

  constructor(
    private authService: AuthService, 
    private adminService: AdminService,
    private router: Router,
    private loaderService: LoaderService
  ) {}

  onSubmit() {
    this.loaderService.show();
    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: (response) => {
        console.log('Login response:', response);
        if (response && response.token) {
          localStorage.setItem('adminToken', response.token);
          localStorage.setItem('userRole', 'admin');
          localStorage.setItem('userId', response._id);
          console.log('Stored Data in localStorage:');
          console.log('Token:', localStorage.getItem('adminToken'));
          console.log('Role:', localStorage.getItem('userRole'));
          console.log('User ID:', localStorage.getItem('userId'));
          
          this.router.navigate(['/admin/dashboard']);
        } else {
          console.error('No token received in login response');
          this.errorMessage = 'Login failed. Please try again.';
        }
        this.loaderService.hide();
      },
      error: (error) => {
        console.error('Login error:', error);
        this.errorMessage = 'Login failed. Please check your credentials.';
        this.loaderService.hide();
      }
    });
  }

  // Show/hide reset password UI
  forgotPassword() {
    this.showReset = true;
    this.resetStep = 1;
    this.resetEmail = '';
    this.resetOtp = '';
    this.resetNewPassword = '';
    this.resetMessage = '';
    this.resetError = '';
  }
  cancelReset() {
    this.showReset = false;
    this.resetStep = 1;
    this.resetEmail = '';
    this.resetOtp = '';
    this.resetNewPassword = '';
    this.resetMessage = '';
    this.resetError = '';
  }
  sendOtp() {
    this.resetMessage = '';
    this.resetError = '';
    if (!this.resetEmail) {
      this.resetError = 'Please enter your email.';
      return;
    }
    this.loaderService.show();
    this.adminService.initiatePasswordReset(this.resetEmail).subscribe({
      next: (res) => {
        this.resetStep = 2;
        this.resetMessage = 'OTP sent to your email.';
        this.loaderService.hide();
      },
      error: (err) => {
        this.resetError = err?.error?.message || 'Failed to send OTP.';
        this.loaderService.hide();
      }
    });
  }
  submitResetPassword() {
    this.resetMessage = '';
    this.resetError = '';
    if (!this.resetEmail || !this.resetOtp || !this.resetNewPassword) {
      this.resetError = 'Please fill all fields.';
      return;
    }
    this.loaderService.show();
    this.adminService.resetPassword({
      email: this.resetEmail,
      otp: this.resetOtp,
      newPassword: this.resetNewPassword
    }).subscribe({
      next: (res) => {
        this.resetMessage = 'Password reset successful! You can now log in.';
        this.resetStep = 1;
        this.showReset = false;
        this.loaderService.hide();
      },
      error: (err) => {
        this.resetError = err?.error?.message || 'Failed to reset password.';
        this.loaderService.hide();
      }
    });
  }
}
