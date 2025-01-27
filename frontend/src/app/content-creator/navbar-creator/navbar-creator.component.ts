import { Component, Output, EventEmitter, Input, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { interval, Subscription } from 'rxjs';
import { CreatorService } from '../../services/creator.service';

interface CreatorProfile {
  username: string;
  email: string;
  profileImage: string;
}

@Component({
  selector: 'app-navbar-creator',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar-creator.component.html',
  styleUrl: './navbar-creator.component.css'
})
export class NavbarCreatorComponent implements OnInit, OnDestroy {
  @Output() toggleSidebar = new EventEmitter<void>();
  @Input() isSidebarCollapsed = false;
  isProfileDropdownOpen = false;
  isMobile = false;

  currentTime = '';
  currentDate = '';
  timeSubscription?: Subscription;

  userProfile: CreatorProfile | null = null;
  unreadNotificationsCount: number = 0;

  constructor(
    private authService: AuthService,
    private router: Router,
    private creatorService: CreatorService
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
    this.router.navigate(['/content-creator/login']);
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
      username: 'Content Creator',
      email: 'creator@example.com',
      profileImage: 'assets/default-avatar.png'
    };
  }

  loadUnreadNotificationsCount() {
    this.creatorService.getNotifications().subscribe({
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
