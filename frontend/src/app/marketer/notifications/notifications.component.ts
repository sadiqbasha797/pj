import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MarketerService } from '../../services/marketer.services';

interface Notification {
  _id: string;
  content: string;
  read: boolean;
  type: string;
  createdAt: string;
  relatedId: string;
}

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.css'
})
export class NotificationsComponent implements OnInit {
  notifications: Notification[] = [];

  constructor(private marketerService: MarketerService) {}

  ngOnInit() {
    this.loadNotifications();
  }

  loadNotifications() {
    this.marketerService.fetchNotifications().subscribe({
      next: (response) => {
        if (response.success) {
          this.notifications = response.data;
        }
      },
      error: (error) => {
        console.error('Error fetching notifications:', error);
      }
    });
  }

  markAllAsRead() {
    this.marketerService.markAllNotificationsAsRead().subscribe({
      next: () => {
        this.notifications = this.notifications.map(notification => ({
          ...notification,
          read: true
        }));
      },
      error: (error) => {
        console.error('Error marking notifications as read:', error);
      }
    });
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
