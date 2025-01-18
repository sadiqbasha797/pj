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
}
