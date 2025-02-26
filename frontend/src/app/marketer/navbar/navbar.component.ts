import { Component, Output, EventEmitter, Input, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { interval, Subscription } from 'rxjs';
import { MarketerService } from '../../services/marketer.services';
import { animate, style, transition, trigger } from '@angular/animations';

interface MarketerProfile {
  username: string;
  email: string;
  profileImage: string;
}

interface NotificationPopup {
  content: string | null;
  visible: boolean;
}

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
  animations: [
    trigger('slideInOut', [
      transition(':enter', [
        style({ transform: 'translateY(-10px)', opacity: 0 }),
        animate('200ms ease-out', style({ transform: 'translateY(0)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ transform: 'translateY(-10px)', opacity: 0 }))
      ])
    ])
  ]
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
  activePopup: NotificationPopup | null = null;
  private previousUnreadCount: number = 0;
  private notificationSound: HTMLAudioElement;
  private hasUserInteracted: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private marketerService: MarketerService
  ) {
    this.notificationSound = new Audio('assets/sounds/notification.mp3');
    this.notificationSound.load();
  }

  ngOnInit() {
    this.startClock();
    this.checkScreenSize();
    this.loadUserProfile();
    this.loadUnreadNotificationsCount();
    this.checkForNewNotifications();
    // Set up polling for notifications (every 30 seconds)
    setInterval(() => {
      this.checkForNewNotifications();
    }, 30000);
    
    // Silently try to get audio permission on any user interaction
    document.addEventListener('click', () => this.handleUserInteraction(), { once: true });
    document.addEventListener('keydown', () => this.handleUserInteraction(), { once: true });
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
    this.marketerService.getProfile().subscribe({
      next: (response) => {
        if (response.success) {
          this.userProfile = {
            username: response.data.username,
            email: response.data.email,
            profileImage: response.data.image  // Using the image URL from the API response
          };
        }
      },
      error: (error) => {
        console.error('Error loading user profile:', error);
      }
    });
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

  private checkForNewNotifications() {
    this.marketerService.fetchNotifications().subscribe({
      next: (response) => {
        if (response.success) {
          const newUnreadCount = response.data.filter((n: any) => !n.read).length;
          
          // Check if there are new notifications
          if (newUnreadCount > this.previousUnreadCount) {
            // Find the latest unread notification
            const latestNotification = response.data.find((n: any) => !n.read);
            if (latestNotification) {
              this.showNotificationPopup(latestNotification);
              this.playNotificationSound();
            }
          }
          
          this.previousUnreadCount = newUnreadCount;
          this.unreadNotificationsCount = newUnreadCount;
        }
      },
      error: (error) => {
        console.error('Error checking for new notifications:', error);
      }
    });
  }

  private showNotificationPopup(notification: any) {
    this.activePopup = {
      content: notification.content,
      visible: true
    };

    // Auto-hide the popup after 3 seconds
    setTimeout(() => {
      this.hideNotificationPopup();
    }, 3000);
  }

  hideNotificationPopup() {
    if (this.activePopup) {
      this.activePopup.visible = false;
      this.activePopup = null;
    }
  }

  private handleUserInteraction() {
    if (!this.hasUserInteracted) {
      this.hasUserInteracted = true;
      this.notificationSound.volume = 0;
      this.notificationSound.play().then(() => {
        this.notificationSound.volume = 1;
      }).catch(() => {
        // Silently handle the error
        this.hasUserInteracted = false;
      });
    }
  }

  private playNotificationSound() {
    if (this.hasUserInteracted) {
      this.notificationSound.play().catch(() => {
        // Silently handle the error
        this.hasUserInteracted = false;
      });
    }
  }
}
