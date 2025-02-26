import { Component, Output, EventEmitter, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { interval, Subscription } from 'rxjs';
import { ManagerAuthService } from '../../services/manager-auth.service';
import { ManagerService } from '../../services/manager.service';
import { animate, style, transition, trigger } from '@angular/animations';

interface Notification {
  _id: string;
  content: string;
  read: boolean;
  type: string;
  date: string;
  relatedId: string;
  time?: string;
}

interface NotificationPopup {
  content: string | null;
  visible: boolean;
}

@Component({
  selector: 'app-navbar-manager',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar-manager.component.html',
  styleUrl: './navbar-manager.component.css',
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
  managerProfile: any = null;
  notifications: Notification[] = [];
  activePopup: NotificationPopup | null = null;
  private previousUnreadCount: number = 0;
  private notificationSound: HTMLAudioElement;
  private hasUserInteracted: boolean = false;

  constructor(
    private managerAuthService: ManagerAuthService,
    private managerService: ManagerService,
    private router: Router
  ) {
    this.notificationSound = new Audio('assets/sounds/notification.mp3');
    this.notificationSound.load();
  }

  ngOnInit() {
    this.startClock();
    this.loadManagerProfile();
    this.loadNotifications();
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

  private loadManagerProfile() {
    this.managerService.getManagerProfile().subscribe({
      next: (profile) => {
        this.managerProfile = profile;
      },
      error: (error) => {
        console.error('Error loading manager profile:', error);
      }
    });
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

  navigateToProfile() {
    this.isProfileDropdownOpen = false;
    this.router.navigate(['/manager/profile']);
  }

  loadNotifications() {
    this.managerService.getNotifications().subscribe({
      next: (response) => {
        this.notifications = response.notifications.map((notification: Notification) => ({
          ...notification,
          time: new Date(notification.date).toLocaleString()
        }));
        this.unreadCount = this.notifications.filter(n => !n.read).length;
      },
      error: (error) => {
        console.error('Error loading notifications:', error);
      }
    });
  }

  markAsRead(notification: Notification) {
    if (!notification.read) {
      this.managerService.markNotificationAsRead(notification._id).subscribe({
        next: () => {
          notification.read = true;
          this.unreadCount = Math.max(0, this.unreadCount - 1);
        },
        error: (error) => {
          console.error('Error marking notification as read:', error);
        }
      });
    }
  }

  markAllAsRead() {
    this.managerService.markAllNotificationsAsRead().subscribe({
      next: () => {
        this.notifications.forEach(notification => notification.read = true);
        this.unreadCount = 0;
        this.isNotificationOpen = false;
      },
      error: (error) => {
        console.error('Error marking all notifications as read:', error);
      }
    });
  }

  handleNotificationClick(notification: Notification) {
    this.markAsRead(notification);
    switch (notification.type) {
      case 'Holiday':
        this.router.navigate(['/manager/leave'], { 
          queryParams: { holidayId: notification.relatedId }
        });
        break;
      case 'Event':
        this.router.navigate(['/manager/calendar'], { 
          queryParams: { eventId: notification.relatedId }
        });
        break;
      // Add more cases as needed
    }
  }

  private checkForNewNotifications() {
    this.managerService.getNotifications().subscribe({
      next: (response) => {
        const newNotifications = response.notifications;
        const newUnreadCount = newNotifications.filter((n: any) => !n.read).length;
        
        // Check if there are new notifications
        if (newUnreadCount > this.previousUnreadCount) {
          // Find the latest unread notification
          const latestNotification = newNotifications.find((n: any) => !n.read);
          if (latestNotification) {
            this.showNotificationPopup(latestNotification);
            this.playNotificationSound();
          }
        }
        
        this.notifications = newNotifications;
        this.previousUnreadCount = newUnreadCount;
        this.unreadCount = newUnreadCount;
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
        this.hasUserInteracted = false;
      });
    }
  }

  private playNotificationSound() {
    if (this.hasUserInteracted) {
      this.notificationSound.play().catch(() => {
        this.hasUserInteracted = false;
      });
    }
  }
}
