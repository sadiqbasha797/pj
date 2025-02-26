import { Component, Output, EventEmitter, Input, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { interval, Subscription } from 'rxjs';
import { ClientAuthService } from '../../services/client-auth.service';
import { ClientService } from '../../services/client.service';
import { animate, style, transition, trigger } from '@angular/animations';

interface NotificationPopup {
  content: string | null;
  visible: boolean;
}

@Component({
  selector: 'app-navbar-client',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './navbar-client.component.html',
  styleUrl: './navbar-client.component.css',
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
export class NavbarClientComponent implements OnInit, OnDestroy {
  @Output() toggleSidebar = new EventEmitter<void>();
  @Input() isSidebarCollapsed = false;
  @Input() isMobile = false;

  isProfileDropdownOpen = false;
  currentTime = '';
  currentDate = '';
  timeSubscription?: Subscription;
  userEmail: string | null = null;
  isNotificationOpen = false;
  notifications: any[] = [];
  unreadCount = 0;
  activePopup: NotificationPopup | null = null;
  private previousUnreadCount: number = 0;
  private notificationSound: HTMLAudioElement;
  private hasUserInteracted: boolean = false;

  constructor(
    private clientAuthService: ClientAuthService,
    private clientService: ClientService,
    private router: Router
  ) {
    this.notificationSound = new Audio('assets/sounds/notification.mp3');
    this.notificationSound.load();
  }

  ngOnInit() {
    this.startClock();
    this.checkScreenSize();
    this.userEmail = localStorage.getItem('email');
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
    document.removeEventListener('click', () => this.handleUserInteraction());
    document.removeEventListener('keydown', () => this.handleUserInteraction());
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

  loadNotifications() {
    this.clientService.fetchNotifications().subscribe({
      next: (notifications) => {
        this.notifications = notifications;
        this.unreadCount = notifications.filter((n: any) => !n.read).length;
      },
      error: (error) => {
        console.error('Error loading notifications:', error);
      }
    });
  }

  toggleNotifications() {
    this.isNotificationOpen = !this.isNotificationOpen;
  }

  markAllAsRead() {
    this.clientService.markAllNotificationsAsRead().subscribe({
      next: () => {
        this.notifications = this.notifications.map(n => ({ ...n, read: true }));
        this.unreadCount = 0;
      },
      error: (error) => {
        console.error('Error marking notifications as read:', error);
      }
    });
  }

  viewAllNotifications() {
    this.router.navigate(['/client/notifications']);
    this.isNotificationOpen = false;
  }

  private checkForNewNotifications() {
    this.clientService.fetchNotifications().subscribe({
      next: (notifications) => {
        const newUnreadCount = notifications.filter((n: any) => !n.read).length;
        
        // Check if there are new notifications
        if (newUnreadCount > this.previousUnreadCount) {
          // Find the latest unread notification
          const latestNotification = notifications.find((n: any) => !n.read);
          if (latestNotification) {
            this.showNotificationPopup(latestNotification);
            this.playNotificationSound();
          }
        }
        
        this.notifications = notifications;
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
