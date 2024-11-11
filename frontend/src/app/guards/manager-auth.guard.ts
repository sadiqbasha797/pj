import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { ManagerAuthService } from '../services/manager-auth.service';

@Injectable({
  providedIn: 'root'
})
export class ManagerAuthGuard implements CanActivate {
  constructor(
    private router: Router,
    private managerAuthService: ManagerAuthService
  ) {}

  canActivate(): boolean {
    if (this.managerAuthService.isLoggedIn() && this.managerAuthService.getUserRole() === 'manager') {
      return true;
    }

    this.router.navigate(['/manager/login']);
    return false;
  }
} 