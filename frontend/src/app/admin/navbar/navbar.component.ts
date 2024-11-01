import { Component, Output, EventEmitter, Input, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { interval, Subscription, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

interface Notification {
  id: number;
  message: string;
  time: string;
  isRead: boolean;
}

interface SearchResult {
  id: number;
  type: 'task' | 'project' | 'document';
  title: string;
  description: string;
}

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
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
  
  notifications: Notification[] = [
    {
      id: 1,
      message: 'New task assigned: UI Design Review',
      time: '5 mins ago',
      isRead: false
    },
    {
      id: 2,
      message: 'Meeting scheduled for 2:00 PM',
      time: '10 mins ago',
      isRead: false
    },
    {
      id: 3,
      message: 'Project deadline updated',
      time: '1 hour ago',
      isRead: true
    }
  ];

  mockSearchData: SearchResult[] = [
    { id: 1, type: 'task', title: 'Update Dashboard UI', description: 'Frontend task' },
    { id: 2, type: 'project', title: 'Client Portal', description: 'Main project' },
    { id: 3, type: 'document', title: 'API Documentation', description: 'Technical docs' },
    { id: 4, type: 'task', title: 'Fix Login Issues', description: 'Bug fix' },
    { id: 5, type: 'project', title: 'Mobile App', description: 'iOS and Android' }
  ];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.unreadCount = this.notifications.filter(n => !n.isRead).length;
  }

  ngOnInit() {
    this.startClock();
    this.checkScreenSize();
  }

  ngOnDestroy() {
    if (this.timeSubscription) {
      this.timeSubscription.unsubscribe();
    }
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
    if (!notification.isRead) {
      notification.isRead = true;
      this.unreadCount--;
    }
  }

  markAllAsRead() {
    this.notifications.forEach(notification => {
      if (!notification.isRead) {
        notification.isRead = true;
      }
    });
    this.unreadCount = 0;
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
}
