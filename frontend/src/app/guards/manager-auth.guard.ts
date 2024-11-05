import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { ManagerService } from '../services/manager.service';

@Injectable({
  providedIn: 'root'
})
export class ManagerAuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean {
    const token = localStorage.getItem('managerToken');
    const role = localStorage.getItem('userRole');

    if (token && role === 'manager') {
      return true;
    }

    this.router.navigate(['/manager/login']);
    return false;
  }
} 