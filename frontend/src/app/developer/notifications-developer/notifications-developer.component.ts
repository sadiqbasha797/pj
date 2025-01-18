import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { DeveloperService } from '../../services/developer.service';

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
  selector: 'app-notifications-developer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './notifications-developer.component.html'
})
export class NotificationsDeveloperComponent implements OnInit {
  notifications: Notification[] = [];
  loading: boolean = true;
  error: string | null = null;
  unreadCount: number = 0;

  constructor(
    private developerService: DeveloperService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadNotifications();
  }

  loadNotifications() {
    this.loading = true;
    this.developerService.fetchDeveloperNotifications().subscribe({
      next: (notifications) => {
        this.notifications = notifications.map((notification: Notification) => ({
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
        this.router.navigate(['/developer/leave'], { 
          queryParams: { id: notification.relatedId }
        });
        break;
      case 'Event':
        this.router.navigate(['/developer/calendar'], { 
          queryParams: { eventId: notification.relatedId }
        });
        break;
      case 'Task':
        this.router.navigate(['/developer/tasks'], { 
          queryParams: { taskId: notification.relatedId }
        });
        break;
      case 'Project':
        this.router.navigate(['/developer/projects'], { 
          queryParams: { projectId: notification.relatedId }
        });
        break;
      default:
        console.warn('Unknown notification type:', notification.type);
    }
  }

  markAsRead(notification: Notification) {
    if (!notification.read) {
      this.developerService.markNotificationAsRead(notification._id).subscribe({
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
    this.developerService.markAllNotificationsAsRead().subscribe({
      next: () => {
        this.notifications.forEach(notification => notification.read = true);
        this.unreadCount = 0;
      },
      error: (error) => {
        console.error('Error marking all notifications as read:', error);
      }
    });
  }

  getTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    const months = Math.floor(days / 30);
    return `${months}mo ago`;
  }
}
