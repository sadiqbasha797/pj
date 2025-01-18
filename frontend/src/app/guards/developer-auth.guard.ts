import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { DeveloperAuthService } from '../services/developer-auth.service';

@Injectable({
  providedIn: 'root'
})
export class DeveloperAuthGuard implements CanActivate {
  constructor(
    private developerAuthService: DeveloperAuthService,
    private router: Router
  ) {}

  canActivate(): boolean {
    if (this.developerAuthService.isLoggedIn()) {
      return true;
    }

    this.router.navigate(['/developer/login']);
    return false;
  }
} 