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
        this.router.navigate(['/content-creator/profile']);
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error.error.message || 'Login failed. Please try again.';
      }
    });
  }
}
