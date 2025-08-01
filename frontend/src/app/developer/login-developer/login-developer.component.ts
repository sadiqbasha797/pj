import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DeveloperAuthService } from '../../services/developer-auth.service';

@Component({
  selector: 'app-login-developer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login-developer.component.html',
  styleUrl: './login-developer.component.css'
})
export class LoginDeveloperComponent {
  credentials = {
    email: '',
    password: ''
  };
  errorMessage = '';
  isLoading = false;

  // Reset password state
  showReset: boolean = false;
  resetEmail: string = '';
  resetOtp: string = '';
  resetNewPassword: string = '';
  resetStep: number = 1; // 1: enter email, 2: enter otp+new password
  resetMessage: string = '';
  resetError: string = '';

  constructor(
    private developerAuthService: DeveloperAuthService,
    private router: Router
  ) {}

  onSubmit() {
    this.isLoading = true;
    this.errorMessage = '';

    this.developerAuthService.login(this.credentials).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/developer/dashboard']);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error.message || 'Login failed';
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
    this.isLoading = true;
    this.developerAuthService.initiatePasswordReset(this.resetEmail).subscribe({
      next: (res) => {
        this.resetStep = 2;
        this.resetMessage = 'OTP sent to your email.';
        this.isLoading = false;
      },
      error: (err) => {
        this.resetError = err?.error?.message || 'Failed to send OTP.';
        this.isLoading = false;
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
    this.isLoading = true;
    this.developerAuthService.resetPassword({
      email: this.resetEmail,
      otp: this.resetOtp,
      newPassword: this.resetNewPassword
    }).subscribe({
      next: (res) => {
        this.resetMessage = 'Password reset successful! You can now log in.';
        this.resetStep = 1;
        this.showReset = false;
        this.isLoading = false;
      },
      error: (err) => {
        this.resetError = err?.error?.message || 'Failed to reset password.';
        this.isLoading = false;
      }
    });
  }
}
