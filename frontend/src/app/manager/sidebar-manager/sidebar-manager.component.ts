import { Component, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar-manager',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar-manager.component.html',
  styleUrl: './sidebar-manager.component.css'
})
export class SidebarManagerComponent {
  @Input() isCollapsed = false;
  @Input() isMobile = false;
  @Output() closeSidebar = new EventEmitter<void>();

  onCloseSidebar() {
    this.closeSidebar.emit();
  }
}
