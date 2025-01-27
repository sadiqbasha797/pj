import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { CreatorService } from '../services/creator.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CreatorAuthGuard implements CanActivate {
  constructor(
    private creatorService: CreatorService,
    private router: Router
  ) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const token = this.creatorService.getToken();
    const role = localStorage.getItem('userRole');
    
    if (token && role === 'creator') {
      return true;
    }
    
    return this.router.createUrlTree(['/content-creator/login']);
  }
}
