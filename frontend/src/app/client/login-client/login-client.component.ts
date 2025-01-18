import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ClientAuthService } from '../../services/client-auth.service';

@Component({
  selector: 'app-login-client',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login-client.component.html',
  styleUrl: './login-client.component.css'
})
export class LoginClientComponent implements OnInit {
  loginData = {
    email: '',
    password: ''
  };
  errorMessage: string = '';
  isLoading: boolean = false;

  constructor(
    private clientAuthService: ClientAuthService,
    private router: Router
  ) {}

  ngOnInit() {
    // Redirect if already logged in
    if (this.clientAuthService.isLoggedIn()) {
      this.router.navigate(['/client/projects']);
    }
  }

  onSubmit(): void {
    if (!this.loginData.email || !this.loginData.password) {
      this.errorMessage = 'Please fill in all fields';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.clientAuthService.login(this.loginData).subscribe({
      next: (response) => {
        // Store email in localStorage if needed
        if (response && response.email) {
          localStorage.setItem('email', response.email);
        }
        // Navigate to projects page
        this.router.navigate(['/client/projects']).then(() => {
          // Optional: Reload the page to ensure all guards are re-evaluated
          window.location.reload();
        });
      },
      error: (error) => {
        console.error('Login error:', error);
        this.errorMessage = error.error?.message || 'An error occurred during login';
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }
}
