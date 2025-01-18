import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar-client',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar-client.component.html',
  styleUrl: './sidebar-client.component.css'
})
export class SidebarClientComponent {
  @Input() isCollapsed: boolean = false;
  @Input() isMobile: boolean = false;

  onCloseSidebar() {
    // Emit an event to parent component to handle mobile sidebar closing
  }
}
