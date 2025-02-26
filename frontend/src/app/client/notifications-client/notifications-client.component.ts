import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClientService } from '../../services/client.service';

interface Notification {
  _id: string;
  content: string;
  read: boolean;
  type: string;
  date: string;
  createdAt: string;
}

@Component({
  selector: 'app-notifications-client',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notifications-client.component.html',
  styleUrl: './notifications-client.component.css'
})
export class NotificationsClientComponent implements OnInit {
  notifications: Notification[] = [];
  loading = true;
  error = '';

  constructor(private clientService: ClientService) {}

  ngOnInit() {
    this.loadNotifications();
  }

  loadNotifications() {
    this.clientService.fetchNotifications().subscribe({
      next: (data) => {
        this.notifications = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load notifications';
        this.loading = false;
      }
    });
  }

  markAllAsRead() {
    this.clientService.markAllNotificationsAsRead().subscribe({
      next: () => {
        this.notifications = this.notifications.map(notification => ({
          ...notification,
          read: true
        }));
      },
      error: (err) => {
        this.error = 'Failed to mark notifications as read';
      }
    });
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
