import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { HRService } from '../services/hr.service';

@Injectable({
  providedIn: 'root'
})
export class HrAuthGuard implements CanActivate {
  constructor(
    private hrService: HRService,
    private router: Router
  ) {}

  canActivate(): boolean {
    // Check if HR token exists in localStorage
    const token = localStorage.getItem('hr_token');
    if (token) {
      return true;
    }

    this.router.navigate(['/hr/login']);
    return false;
  }
} 