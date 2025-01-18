import { Component, Output, EventEmitter, Input, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { interval, Subscription } from 'rxjs';
import { ClientAuthService } from '../../services/client-auth.service';

@Component({
  selector: 'app-navbar-client',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './navbar-client.component.html',
  styleUrl: './navbar-client.component.css'
})
export class NavbarClientComponent implements OnInit, OnDestroy {
  @Output() toggleSidebar = new EventEmitter<void>();
  @Input() isSidebarCollapsed = false;
  @Input() isMobile = false;

  isProfileDropdownOpen = false;
  currentTime = '';
  currentDate = '';
  timeSubscription?: Subscription;
  userEmail: string | null = null;

  constructor(
    private clientAuthService: ClientAuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.startClock();
    this.checkScreenSize();
    this.userEmail = localStorage.getItem('email');
  }

  ngOnDestroy() {
    if (this.timeSubscription) {
      this.timeSubscription.unsubscribe();
    }
  }

  private startClock() {
    const updateDateTime = () => {
      const now = new Date();
      this.currentTime = now.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit'
      });
      this.currentDate = now.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      });
    };
    
    updateDateTime();
    this.timeSubscription = interval(60000).subscribe(updateDateTime);
  }

  onToggleSidebar() {
    this.toggleSidebar.emit();
  }

  toggleProfileDropdown() {
    this.isProfileDropdownOpen = !this.isProfileDropdownOpen;
  }

  onSignOut() {
    this.clientAuthService.logout();
    this.router.navigate(['/client/login']);
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkScreenSize();
  }

  private checkScreenSize() {
    this.isMobile = window.innerWidth < 768;
  }
}
