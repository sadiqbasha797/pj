import { Component, Output, EventEmitter, Input, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { interval, Subscription } from 'rxjs';
import { HRService } from '../../services/hr.service';
import { animate, style, transition, trigger } from '@angular/animations';

interface HRProfile {
  name: string;
  email: string;
  profileImage?: string;
}

interface Notification {
  _id: string;
  content: string;
  read: boolean;
  type: string;
  date: string;
  relatedId: string;
  time?: string;
  createdAt: string | number | Date;
}

@Component({
  selector: 'app-navbar-hr',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './navbar-hr.component.html',
  styleUrls: ['./navbar-hr.component.css'],
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
export class NavbarHrComponent implements OnInit, OnDestroy {
  @Output() toggleSidebar = new EventEmitter<void>();
  @Input() isSidebarCollapsed = false;
  @Input() isMobile = false;
  
  isProfileDropdownOpen = false;
  isNotificationOpen = false;
  currentTime = '';
  currentDate = '';
  timeSubscription?: Subscription;
  
  userProfile: HRProfile | null = null;
  unreadCount = 0;
  notifications: Notification[] = [];

  constructor(
    private hrService: HRService,
    private router: Router
  ) {}

  ngOnInit() {
    this.startClock();
    this.checkScreenSize();
    this.loadUserProfile();
    this.loadNotifications();
    // Set up polling for notifications (every 30 seconds)
    setInterval(() => {
      this.loadNotifications();
    }, 30000);
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
    localStorage.removeItem('hr_token');
    localStorage.removeItem('hr_data');
    this.router.navigate(['/hr/login']);
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkScreenSize();
  }

  private checkScreenSize() {
    this.isMobile = window.innerWidth < 768;
  }

  private loadUserProfile() {
    const hrData = localStorage.getItem('hr_data');
    if (hrData) {
      this.userProfile = JSON.parse(hrData);
    }
  }

  private loadNotifications() {
    this.hrService.getNotifications().subscribe({
      next: (response) => {
        this.notifications = response.notifications.map((notification: Notification) => ({
          ...notification,
          time: new Date(notification.createdAt).toLocaleString()
        }));
        this.unreadCount = this.notifications.filter(n => !n.read).length;
      },
      error: (error) => {
        console.error('Error loading notifications:', error);
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
        this.router.navigate(['/hr/leaves'], { 
          queryParams: { id: notification.relatedId }
        });
        break;
      case 'team_request':
        this.router.navigate(['/hr/team-requests'], { 
          queryParams: { requestId: notification.relatedId }
        });
        break;
      default:
        console.warn('Unknown notification type:', notification.type);
    }
    this.isNotificationOpen = false;
  }

  markAsRead(notification: Notification) {
    if (!notification.read) {
      this.hrService.markNotificationAsRead(notification._id).subscribe({
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
    this.hrService.markAllNotificationsAsRead().subscribe({
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
}
