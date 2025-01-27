import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CreatorService } from '../../services/creator.service';

interface Notification {
  _id: string;
  content: string;
  read: boolean;
  type: string;
  createdAt: string;
  relatedId: string;
}

@Component({
  selector: 'app-notifications-creator',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notifications-creator.component.html',
  styleUrl: './notifications-creator.component.css'
})
export class NotificationsCreatorComponent implements OnInit {
  notifications: Notification[] = [];

  constructor(private creatorService: CreatorService) {}

  ngOnInit() {
    this.loadNotifications();
  }

  loadNotifications() {
    this.creatorService.getNotifications().subscribe({
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
    this.creatorService.markAllNotificationsAsRead().subscribe({
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
