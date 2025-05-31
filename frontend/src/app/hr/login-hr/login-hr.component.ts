import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HRService } from '../../services/hr.service';

@Component({
  selector: 'app-login-hr',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login-hr.component.html',
  styleUrl: './login-hr.component.css'
})
export class LoginHrComponent {
  loginData = {
    email: '',
    password: ''
  };
  errorMessage = '';

  constructor(
    private hrService: HRService,
    private router: Router
  ) {}

  onSubmit() {
    this.errorMessage = '';
    this.hrService.login(this.loginData).subscribe({
      next: (response) => {
        // Store token and HR data in localStorage
        localStorage.setItem('hr_token', response.token);
        localStorage.setItem('hr_data', JSON.stringify(response.hr));
        // Redirect to users page
        this.router.navigate(['/hr/users']);
      },
      error: (error) => {
        this.errorMessage = error.error.message || 'Login failed. Please try again.';
      }
    });
  }
}
