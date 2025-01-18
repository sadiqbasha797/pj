import { Component, Output, EventEmitter, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { interval, Subscription } from 'rxjs';
import { ManagerAuthService } from '../../services/manager-auth.service';
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
  selector: 'app-navbar-manager',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar-manager.component.html',
  styleUrl: './navbar-manager.component.css'
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

  constructor(
    private managerAuthService: ManagerAuthService,
    private managerService: ManagerService,
    private router: Router
  ) {}

  ngOnInit() {
    this.startClock();
    this.loadManagerProfile();
    this.loadNotifications();
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
}
