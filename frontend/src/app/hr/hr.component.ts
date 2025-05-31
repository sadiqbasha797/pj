import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarHrComponent } from './sidebar-hr/sidebar-hr.component';
import { NavbarHrComponent } from './navbar-hr/navbar-hr.component';

@Component({
  selector: 'app-hr',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarHrComponent, NavbarHrComponent],
  templateUrl: './hr.component.html',
  styleUrls: ['./hr.component.css']
})
export class HrComponent implements OnInit {
  isSidebarCollapsed = false;
  isMobile = false;

  ngOnInit() {
    this.checkScreenSize();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkScreenSize();
  }

  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  closeSidebar() {
    this.isSidebarCollapsed = true;
  }

  private checkScreenSize() {
    this.isMobile = window.innerWidth < 768;
    if (this.isMobile) {
      this.isSidebarCollapsed = true;
    }
  }
}
