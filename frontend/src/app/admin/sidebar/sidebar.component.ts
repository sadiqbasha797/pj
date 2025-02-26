import { Component, Input, Output, EventEmitter, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminService } from '../../services/admin.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  @Input() isCollapsed = false;
  @Output() closeSidebar = new EventEmitter<void>();
  isMobile = false;
  pendingRequestsCount: number = 0;

  constructor(
    private adminService: AdminService
  ) {}

  ngOnInit() {
    this.checkScreenSize();
    this.loadPendingRequestsCount();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkScreenSize();
  }

  onCloseSidebar() {
    this.closeSidebar.emit();
  }

  private checkScreenSize() {
    this.isMobile = window.innerWidth < 768;
  }

  loadPendingRequestsCount() {
    this.adminService.getPendingRequests().subscribe({
      next: (response) => {
        this.pendingRequestsCount = response.requests.length;
      },
      error: (error) => {
        console.error('Error loading pending requests count:', error);
      }
    });
  }
}
