import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { ClientAuthService } from '../services/client-auth.service';

@Injectable({
  providedIn: 'root'
})
export class ClientAuthGuard implements CanActivate {
  constructor(
    private router: Router,
    private clientAuthService: ClientAuthService
  ) {}

  canActivate(): boolean {
    if (this.clientAuthService.isLoggedIn() && this.clientAuthService.getUserRole() === 'client') {
      return true;
    }

    this.router.navigate(['/client/login']);
    return false;
  }
} 