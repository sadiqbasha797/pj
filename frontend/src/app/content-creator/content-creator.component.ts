import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarCreatorComponent } from './sidebar-creator/sidebar-creator.component';
import { NavbarCreatorComponent } from './navbar-creator/navbar-creator.component';

@Component({
  selector: 'app-content-creator',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarCreatorComponent, NavbarCreatorComponent],
  templateUrl: './content-creator.component.html',
  styleUrl: './content-creator.component.css'
})
export class ContentCreatorComponent implements OnInit {
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
