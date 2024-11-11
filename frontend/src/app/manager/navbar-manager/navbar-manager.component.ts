import { Component, Output, EventEmitter, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { interval, Subscription } from 'rxjs';
import { ManagerAuthService } from '../../services/manager-auth.service';

@Component({
  selector: 'app-navbar-manager',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar-manager.component.html',
  styleUrl: './navbar-manager.component.css'
})
export class NavbarManagerComponent implements OnInit, OnDestroy {
  @Output() toggleSidebar = new EventEmitter<void>();
  @Input() isSidebarCollapsed = false;
  @Input() isMobile = false;

  currentTime = '';
  currentDate = '';
  timeSubscription?: Subscription;
  isProfileDropdownOpen = false;
  isNotificationOpen = false;
  unreadCount = 0;

  constructor(
    private managerAuthService: ManagerAuthService
  ) {}

  ngOnInit() {
    this.startClock();
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
    if (this.isProfileDropdownOpen) {
      this.isNotificationOpen = false;
    }
  }

  toggleNotifications() {
    this.isNotificationOpen = !this.isNotificationOpen;
    if (this.isNotificationOpen) {
      this.isProfileDropdownOpen = false;
    }
  }

  onSignOut() {
    this.managerAuthService.logout();
  }
}
