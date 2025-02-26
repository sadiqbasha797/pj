import { Component, Output, EventEmitter, Input, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { interval, Subscription, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { AdminService } from '../../services/admin.service';
import { animate, style, transition, trigger } from '@angular/animations';

interface Notification {
  time: any;
  _id: string;
  content: string;
  read: boolean;
  type: string;
  date: string;
  relatedId: string;
}

interface SearchResult {
  id: number;
  type: 'task' | 'project' | 'document';
  title: string;
  description: string;
}

interface AdminProfile {
  username: string;
  email: string;
  profileImage: string;
  // ... other profile fields
}

interface NotificationPopup {
  content: string | null;
  visible: boolean;
}

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
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
export class NavbarComponent implements OnInit, OnDestroy {
  @Output() toggleSidebar = new EventEmitter<void>();
  @Input() isSidebarCollapsed = false;
  isProfileDropdownOpen = false;
  isNotificationOpen = false;
  isSearchOpen = false;
  isMobile = false;

  currentTime = '';
  currentDate = '';
  timeSubscription?: Subscription;

  searchQuery = '';
  unreadCount = 0;
  isSearchResultsVisible = false;
  searchResults: SearchResult[] = [];
  private searchSubject = new Subject<string>();
  
  notifications: Notification[] = [];

  mockSearchData: SearchResult[] = [
    { id: 1, type: 'task', title: 'Update Dashboard UI', description: 'Frontend task' },
    { id: 2, type: 'project', title: 'Client Portal', description: 'Main project' },
    { id: 3, type: 'document', title: 'API Documentation', description: 'Technical docs' },
    { id: 4, type: 'task', title: 'Fix Login Issues', description: 'Bug fix' },
    { id: 5, type: 'project', title: 'Mobile App', description: 'iOS and Android' }
  ];

  userProfile: AdminProfile | null = null;

  activePopup: NotificationPopup | null = null;
  private previousUnreadCount: number = 0;
  private notificationSound: HTMLAudioElement;
  private hasUserInteracted: boolean = false;

  constructor(
    private authService: AuthService,
    private adminService: AdminService,
    private router: Router
  ) {
    this.unreadCount = this.notifications.filter(n => !n.read).length;
    this.notificationSound = new Audio('assets/sounds/notification.mp3');
    this.notificationSound.load();
  }

  ngOnInit() {
    this.startClock();
    this.checkScreenSize();
    this.loadUserProfile();
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
      
      // Update time
      this.currentTime = now.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit'
      });
      
      // Update date
      this.currentDate = now.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      });
    };
    
    updateDateTime(); // Initial update
    this.timeSubscription = interval(60000).subscribe(updateDateTime); // Update every minute
  }

  onToggleSidebar() {
    this.toggleSidebar.emit();
  }

  toggleProfileDropdown() {
    this.isProfileDropdownOpen = !this.isProfileDropdownOpen;
    if (this.isProfileDropdownOpen) {
      this.isNotificationOpen = false;
      this.isSearchOpen = false;
    }
  }

  toggleNotifications() {
    this.isNotificationOpen = !this.isNotificationOpen;
    if (this.isNotificationOpen) {
      this.isProfileDropdownOpen = false;
      this.isSearchOpen = false;
    }
  }

  toggleSearch() {
    this.isSearchOpen = !this.isSearchOpen;
    if (this.isSearchOpen) {
      this.isProfileDropdownOpen = false;
      this.isNotificationOpen = false;
    }
  }

  markAsRead(notification: Notification) {
    if (!notification.read) {
      this.adminService.markNotificationAsRead(notification._id).subscribe({
        next: () => {
          notification.read = true;
          this.unreadCount = this.notifications.filter(n => !n.read).length;
          
          // Navigate based on notification type
          switch (notification.type) {
            case 'Holiday':
              this.router.navigate(['/admin/leave'], { queryParams: { id: notification.relatedId }});
              break;
            case 'Event':
              this.router.navigate(['/admin/calendar'], { queryParams: { eventId: notification.relatedId }});
              break;
            // Add more cases as needed
          }
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
        this.notifications.forEach(notification => {
          notification.read = true;
        });
        this.unreadCount = 0;
        this.isNotificationOpen = false; // Close the notification dropdown
      },
      error: (error) => {
        console.error('Error marking all notifications as read:', error);
      }
    });
  }

  onSearchInput(event: any) {
    const searchTerm = event.target.value;
    if (searchTerm.length >= 2) {
      this.searchSubject.next(searchTerm);
      this.isSearchResultsVisible = true;
    } else {
      this.searchResults = [];
      this.isSearchResultsVisible = false;
    }
  }

  performSearch(searchTerm: string) {
    // Mock search implementation - replace with actual API call
    this.searchResults = this.mockSearchData.filter(item =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  navigateToResult(result: SearchResult) {
    // Implement navigation based on result type
    switch (result.type) {
      case 'task':
        this.router.navigate(['/admin/tasks', result.id]);
        break;
      case 'project':
        this.router.navigate(['/admin/projects', result.id]);
        break;
      case 'document':
        this.router.navigate(['/admin/documents', result.id]);
        break;
    }
    this.clearSearch();
  }

  clearSearch() {
    this.searchQuery = '';
    this.searchResults = [];
    this.isSearchResultsVisible = false;
  }

  onSignOut() {
    this.authService.logout();
    this.router.navigate(['/admin/login']);
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkScreenSize();
  }

  private checkScreenSize() {
    this.isMobile = window.innerWidth < 768;
  }

  loadUserProfile() {
    this.adminService.getProfile().subscribe({
      next: (profile) => {
        this.userProfile = profile;
      },
      error: (error) => {
        console.error('Error loading profile:', error);
      }
    });
  }

  loadNotifications() {
    this.adminService.getAllNotifications().subscribe({
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

  private checkForNewNotifications() {
    this.adminService.getAllNotifications().subscribe({
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
