import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ManagerService } from '../../services/manager.service';
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
    private managerService: ManagerService,
    private router: Router,
    private loaderService: LoaderService
  ) {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('managerToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
  }

  onSubmit() {
    this.loaderService.show();
    this.managerService.login({ email: this.email, password: this.password }).subscribe({
      next: (response) => {
        if (response && response.token) {
          localStorage.clear();
          
          localStorage.setItem('managerToken', response.token);
          localStorage.setItem('userRole', 'manager');
          if (response.userId) {
            localStorage.setItem('userId', response.userId);
          }
          
          this.router.navigate(['/manager/dashboard']);
        } else {
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
}
