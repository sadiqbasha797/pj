import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarManagerComponent } from './sidebar-manager/sidebar-manager.component';
import { NavbarManagerComponent } from './navbar-manager/navbar-manager.component';

@Component({
  selector: 'app-manager',
  standalone: true,
  imports: [
    CommonModule, 
    RouterOutlet, 
    SidebarManagerComponent, 
    NavbarManagerComponent
  ],
  templateUrl: './manager.component.html',
  styleUrls: ['./manager.component.css']
})
export class ManagerComponent implements OnInit {
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
