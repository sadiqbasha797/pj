import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CreatorService } from '../../services/creator.service';

@Component({
  selector: 'app-login-creator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login-creator.component.html',
  styleUrl: './login-creator.component.css'
})
export class LoginCreatorComponent {
  credentials = {
    email: '',
    password: ''
  };
  errorMessage = '';
  loading = false;
  // Forgot/Reset Password State
  resetStep: number = 1; // 1: enter email, 2: enter otp+new password
  resetEmail: string = '';
  resetOtp: string = '';
  resetNewPassword: string = '';
  resetMessage: string = '';
  resetError: string = '';
  showReset: boolean = false;

  constructor(
    private creatorService: CreatorService,
    private router: Router
  ) {}

  onSubmit() {
    this.loading = true;
    this.errorMessage = '';

    this.creatorService.login(this.credentials).subscribe({
      next: (response) => {
        this.loading = false;
        localStorage.setItem('userId', response.user.id);
        this.router.navigate(['/content-creator/tasks']);
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error.error.message || 'Login failed. Please try again.';
      }
    });
  }

  forgotPassword() {
    this.resetStep = 1;
    this.resetEmail = this.credentials.email;
    this.resetOtp = '';
    this.resetNewPassword = '';
    this.resetMessage = '';
    this.resetError = '';
    this.showReset = true;
  }
  sendResetOtp() {
    if (!this.resetEmail) {
      this.resetError = 'Please enter your email.';
      return;
    }
    this.resetError = '';
    this.creatorService
      .forgotPassword(this.resetEmail)
      .subscribe({
        next: (res) => {
          this.resetStep = 2;
          this.resetMessage = 'OTP sent to your email.';
        },
        error: (err) => {
          this.resetError = err?.error?.message || 'Failed to send OTP.';
        },
      });
  }
  submitResetPassword() {
    if (!this.resetEmail || !this.resetOtp || !this.resetNewPassword) {
      this.resetError = 'Please fill all fields.';
      return;
    }
    this.resetError = '';
    this.creatorService
      .resetPassword({
        email: this.resetEmail,
        otp: this.resetOtp,
        newPassword: this.resetNewPassword,
      })
      .subscribe({
        next: (res) => {
          this.resetMessage = 'Password reset successful! You can now log in.';
          this.resetStep = 1;
          this.showReset = false;
        },
        error: (err) => {
          this.resetError = err?.error?.message || 'Failed to reset password.';
        },
      });
  }
}