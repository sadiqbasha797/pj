import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AdminService } from '../../services/admin.service';
import { animate, style, transition, trigger } from '@angular/animations';

interface Notification {
  _id: string;
  content: string | null;
  read: boolean;
  type: string;
  date: string;
  createdAt: string;
  relatedId: string;
  time?: string;
}

interface NotificationPopup {
  content: string | null;
  visible: boolean;
}

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.css',
  animations: [
    trigger('slideInOut', [
      transition(':enter', [
        style({ transform: 'translateY(-100%)' }),
        animate('300ms ease-in', style({ transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('300ms ease-out', style({ transform: 'translateY(-100%)' }))
      ])
    ])
  ]
})
export class NotificationsComponent implements OnInit {
  notifications: Notification[] = [];
  loading: boolean = true;
  error: string | null = null;
  unreadCount: number = 0;
  private previousUnreadCount: number = 0;
  activePopup: NotificationPopup | null = null;
  private notificationSound: HTMLAudioElement;

  constructor(
    private adminService: AdminService,
    private router: Router
  ) {
    // Initialize audio element
    this.notificationSound = new Audio('assets/sounds/notification.mp3');
  }

  ngOnInit() {
    this.loadNotifications();
    // Set up polling for new notifications every 30 seconds
    setInterval(() => {
      this.checkForNewNotifications();
    }, 30000);
  }

  loadNotifications() {
    this.loading = true;
    this.adminService.getAllNotifications().subscribe({
      next: (response) => {
        this.notifications = response.notifications.map((notification: Notification) => ({
          ...notification,
          time: this.formatNotificationDate(notification)
        }));
        this.unreadCount = this.notifications.filter(n => !n.read).length;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading notifications:', error);
        this.error = 'Failed to load notifications';
        this.loading = false;
      }
    });
  }

  private formatNotificationDate(notification: any): string {
    // First try to use createdAt, then fall back to date
    const dateToUse = notification.createdAt || notification.date;
    
    try {
      return new Date(dateToUse).toLocaleString();
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  }

  handleNotificationClick(notification: Notification) {
    this.markAsRead(notification);
    this.navigateToRelatedContent(notification);
  }

  navigateToRelatedContent(notification: Notification) {
    switch (notification.type) {
      case 'Holiday':
        this.router.navigate(['/admin/leave'], { 
          queryParams: { id: notification.relatedId }
        });
        break;
      case 'Event':
        this.router.navigate(['/admin/calendar'], { 
          queryParams: { eventId: notification.relatedId }
        });
        break;
      // Add more cases as needed
      default:
        console.warn('Unknown notification type:', notification.type);
    }
  }

  markAsRead(notification: Notification) {
    if (!notification.read) {
      this.adminService.markNotificationAsRead(notification._id).subscribe({
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
    this.adminService.markAllNotificationsAsRead().subscribe({
      next: () => {
        this.notifications.forEach(notification => notification.read = true);
        this.unreadCount = 0;
      },
      error: (error) => {
        console.error('Error marking all notifications as read:', error);
      }
    });
  }

  private checkForNewNotifications() {
    this.adminService.getAllNotifications().subscribe({
      next: (response) => {
        const newNotifications = response.notifications.map((notification: Notification) => ({
          ...notification,
          time: this.formatNotificationDate(notification)
        }));
        
        const newUnreadCount = newNotifications.filter((n: { read: any; }) => !n.read).length;
        
        // Check if there are new notifications
        if (newUnreadCount > this.previousUnreadCount) {
          // Find the new notifications
          const latestNotification = newNotifications.find((n: { read: any; }) => !n.read);
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

  private showNotificationPopup(notification: Notification) {
    this.activePopup = {
      content: notification.content,
      visible: true
    };

    // Auto-hide the popup after 5 seconds
    setTimeout(() => {
      this.hideNotificationPopup();
    }, 5000);
  }

  hideNotificationPopup() {
    if (this.activePopup) {
      this.activePopup.visible = false;
      this.activePopup = null;
    }
  }

  private playNotificationSound() {
    this.notificationSound.play().catch(error => {
      console.error('Error playing notification sound:', error);
    });
  }
}
