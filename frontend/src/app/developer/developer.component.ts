import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SidebarDeveloperComponent } from './sidebar-developer/sidebar-developer.component';
import { NavbarDeveloperComponent } from './navbar-developer/navbar-developer.component';

@Component({
  selector: 'app-developer',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarDeveloperComponent, NavbarDeveloperComponent],
  templateUrl: './developer.component.html',
  styleUrls: ['./developer.component.css']
})
export class DeveloperComponent implements OnInit {
  isSidebarCollapsed = false;
  isMobile = false;
  isDarkMode = false;

  constructor() { }

  ngOnInit() {
    this.checkScreenSize();
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
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
