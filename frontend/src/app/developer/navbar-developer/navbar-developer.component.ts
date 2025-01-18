import { Component, Output, EventEmitter, Input, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { interval, Subscription } from 'rxjs';
import { ThemeService } from '../../services/theme.service';
import { DeveloperService } from '../../services/developer.service';

interface SearchResult {
  id: number;
  type: 'task' | 'project' | 'document';
  title: string;
  description: string;
}

interface Notification {
  _id: string;
  content: string;
  type: string;
  date: string;
  read: boolean;
  relatedId?: string;
}

@Component({
  selector: 'app-navbar-developer',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './navbar-developer.component.html',
  styleUrls: ['./navbar-developer.component.css']
})
export class NavbarDeveloperComponent implements OnInit, OnDestroy {
  @Output() toggleSidebar = new EventEmitter<void>();
  @Input() isSidebarCollapsed = false;
  isProfileDropdownOpen = false;
  isNotificationOpen = false;
  isSearchOpen = false;
  isMobile = false;
  isDarkMode = true;

  currentTime = '';
  currentDate = '';
  timeSubscription?: Subscription;

  searchQuery = '';
  unreadCount = 0;
  isSearchResultsVisible = false;
  searchResults: SearchResult[] = [];

  notifications: Notification[] = [];
  totalUnreadCount = 0;

  developerName: string = '';
  developerImage: string = '';

  // Mock data
  mockSearchData: SearchResult[] = [
    { id: 1, type: 'task', title: 'Implement API', description: 'Backend task' },
    { id: 2, type: 'project', title: 'E-commerce App', description: 'React project' },
    { id: 3, type: 'document', title: 'Technical Specs', description: 'Documentation' }
  ];

  constructor(
    private router: Router, 
    private themeService: ThemeService,
    private developerService: DeveloperService
  ) {
    this.themeService.darkMode$.subscribe(
      isDark => this.isDarkMode = isDark
    );
  }

  ngOnInit() {
    this.startClock();
    this.checkScreenSize();
    this.fetchNotifications();
    this.fetchDeveloperProfile();
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

  onSearchInput(event: any) {
    const searchTerm = event.target.value;
    if (searchTerm.length >= 2) {
      this.performSearch(searchTerm);
      this.isSearchResultsVisible = true;
    } else {
      this.searchResults = [];
      this.isSearchResultsVisible = false;
    }
  }

  performSearch(searchTerm: string) {
    this.searchResults = this.mockSearchData.filter(item =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  navigateToResult(result: SearchResult) {
    switch (result.type) {
      case 'task':
        this.router.navigate(['/developer/tasks', result.id]);
        break;
      case 'project':
        this.router.navigate(['/developer/projects', result.id]);
        break;
      case 'document':
        this.router.navigate(['/developer/documents', result.id]);
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
    // Will implement with auth service later
    this.router.navigate(['/developer/login']);
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.checkScreenSize();
  }

  private checkScreenSize() {
    this.isMobile = window.innerWidth < 768;
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  fetchNotifications() {
    this.developerService.fetchDeveloperNotifications().subscribe({
      next: (data) => {
        this.totalUnreadCount = data.filter((n: { read: any; }) => !n.read).length;
        this.notifications = data.slice(0, 5);
      },
      error: (error) => {
        console.error('Error fetching notifications:', error);
      }
    });
  }

  markNotificationAsRead(notificationId: string) {
    this.developerService.markNotificationAsRead(notificationId).subscribe(() => {
      this.notifications = this.notifications.map(notification => {
        if (notification._id === notificationId) {
          notification.read = true;
        }
        return notification;
      });
      this.totalUnreadCount = Math.max(0, this.totalUnreadCount - 1);
    });
  }

  markAllNotificationsAsRead() {
    this.developerService.markAllNotificationsAsRead().subscribe(() => {
      this.notifications = this.notifications.map(notification => {
        notification.read = true;
        return notification;
      });
      this.totalUnreadCount = 0;
    });
  }

  fetchDeveloperProfile() {
    this.developerService.getProfile().subscribe({
      next: (response) => {
        this.developerName = response.developer.username;
        this.developerImage = response.developer.image || 'assets/default-avatar.png';
      },
      error: (error) => {
        console.error('Error fetching developer profile:', error);
        this.developerName = 'Developer';
        this.developerImage = 'assets/default-avatar.png';
      }
    });
  }
}
