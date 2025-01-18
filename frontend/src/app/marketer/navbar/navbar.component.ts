import { Component, Output, EventEmitter, Input, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { interval, Subscription } from 'rxjs';
import { MarketerService } from '../../services/marketer.services';

interface MarketerProfile {
  username: string;
  email: string;
  profileImage: string;
}

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit, OnDestroy {
  @Output() toggleSidebar = new EventEmitter<void>();
  @Input() isSidebarCollapsed = false;
  isProfileDropdownOpen = false;
  isMobile = false;

  currentTime = '';
  currentDate = '';
  timeSubscription?: Subscription;

  userProfile: MarketerProfile | null = null;
  unreadNotificationsCount: number = 0;

  constructor(
    private authService: AuthService,
    private router: Router,
    private marketerService: MarketerService
  ) {}

  ngOnInit() {
    this.startClock();
    this.checkScreenSize();
    this.loadUserProfile();
    this.loadUnreadNotificationsCount();
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
    this.authService.logout();
    this.router.navigate(['/marketer/login']);
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkScreenSize();
  }

  private checkScreenSize() {
    this.isMobile = window.innerWidth < 768;
  }

  private loadUserProfile() {
    // Replace with actual API call when available
    this.userProfile = {
      username: 'Marketer User',
      email: 'marketer@example.com',
      profileImage: 'assets/default-avatar.png'
    };
  }

  loadUnreadNotificationsCount() {
    this.marketerService.fetchNotifications().subscribe({
      next: (response) => {
        if (response.success) {
          this.unreadNotificationsCount = response.data.filter(
            (notification: any) => !notification.read
          ).length;
        }
      },
      error: (error) => {
        console.error('Error fetching notifications:', error);
      }
    });
  }
}
