import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ManagerAuthService } from '../../services/manager-auth.service';
import { LoaderService } from '../../services/loader.service';

@Component({
  selector: 'app-login-manager',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login-manager.component.html',
  styleUrl: './login-manager.component.css'
})
export class LoginManagerComponent {
  email: string = '';
  password: string = '';
  errorMessage: string = '';

  constructor(
    private managerAuthService: ManagerAuthService,
    private router: Router,
    private loaderService: LoaderService
  ) {
    localStorage.clear();
  }

  onSubmit() {
    this.loaderService.show();
    this.managerAuthService.login({ email: this.email, password: this.password }).subscribe({
      next: (response) => {
        console.log('Login response:', response);
        if (response && response.token) {
          console.log('Stored Data in localStorage:');
          console.log('Token:', localStorage.getItem('managerToken'));
          console.log('Role:', localStorage.getItem('userRole'));
          console.log('User ID:', localStorage.getItem('userId'));
          console.log('Username:', localStorage.getItem('username'));
          console.log('Email:', localStorage.getItem('email'));
          
          this.router.navigate(['/manager/dashboard']);
        } else {
          console.error('No token received in login response');
          this.errorMessage = 'Login failed. Please try again.';
        }
        this.loaderService.hide();
      },
      error: (error) => {
        console.error('Login error:', error);
        this.errorMessage = error.error?.message || 'Login failed. Please check your credentials.';
        this.loaderService.hide();
      }
    });
  }
}
