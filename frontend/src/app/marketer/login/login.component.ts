import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MarketerService } from '../../services/marketer.services';
import { LoaderService } from '../../services/loader.service';

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

  constructor(
    private marketerService: MarketerService, 
    private router: Router,
    private loaderService: LoaderService
  ) {}

  onSubmit() {
    this.loaderService.show();
    this.marketerService.login({ email: this.email, password: this.password }).subscribe({
      next: (response) => {
        console.log('Login response:', response);
        if (response && response.token) {
          // Store token and user data
          localStorage.setItem('marketerToken', response.token);
          localStorage.setItem('marketerUser', JSON.stringify(response.user));
          localStorage.setItem('userRole', 'marketer');
          localStorage.setItem('userId', response.user.id);
          
          console.log('Stored Data in localStorage:');
          console.log('Token:', localStorage.getItem('marketerToken'));
          console.log('User:', localStorage.getItem('marketerUser'));
          
          this.router.navigate(['/marketer/tasks']);
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
}
