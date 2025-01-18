import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ManagerService } from '../../services/manager.service';

interface Notification {
  _id: string;
  content: string;
  read: boolean;
  type: string;
  date: string;
  relatedId: string;
  time?: string;
}

@Component({
  selector: 'app-notifications-manager',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './notifications-manager.component.html',
  styleUrl: './notifications-manager.component.css'
})
export class NotificationsManagerComponent implements OnInit {
  notifications: Notification[] = [];
  loading: boolean = true;
  error: string | null = null;
  unreadCount: number = 0;

  constructor(
    private managerService: ManagerService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadNotifications();
  }

  loadNotifications() {
    this.loading = true;
    this.managerService.getNotifications().subscribe({
      next: (response) => {
        this.notifications = response.notifications.map((notification: Notification) => ({
          ...notification,
          time: new Date(notification.date).toLocaleString()
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

  handleNotificationClick(notification: Notification) {
    this.markAsRead(notification);
    this.navigateToRelatedContent(notification);
  }

  navigateToRelatedContent(notification: Notification) {
    switch (notification.type) {
      case 'Holiday':
        this.router.navigate(['/manager/holidays'], { 
          queryParams: { id: notification.relatedId }
        });
        break;
      case 'Event':
        this.router.navigate(['/manager/calendar'], { 
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
      },
      error: (error) => {
        console.error('Error marking all notifications as read:', error);
      }
    });
  }
}
