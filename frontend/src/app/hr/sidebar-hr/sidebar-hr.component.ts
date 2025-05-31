import { Component, Input, Output, EventEmitter, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HRService } from '../../services/hr.service';

@Component({
  selector: 'app-sidebar-hr',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar-hr.component.html',
  styleUrls: ['./sidebar-hr.component.css']
})
export class SidebarHrComponent implements OnInit {
  @Input() isCollapsed = false;
  @Output() closeSidebar = new EventEmitter<void>();
  isMobile = false;
  pendingRequestsCount: number = 0;

  constructor(
    private hrService: HRService
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
    this.hrService.getPendingTeamRequests().subscribe({
      next: (response) => {
        this.pendingRequestsCount = response.length;
      },
      error: (error) => {
        console.error('Error loading pending requests count:', error);
      }
    });
  }
}
