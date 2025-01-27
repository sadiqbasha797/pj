import { Component, Input, Output, EventEmitter, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar-creator',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar-creator.component.html',
  styleUrl: './sidebar-creator.component.css'
})
export class SidebarCreatorComponent implements OnInit {
  @Input() isCollapsed = false;
  @Output() closeSidebar = new EventEmitter<void>();
  isMobile = false;

  ngOnInit() {
    this.checkScreenSize();
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
}
