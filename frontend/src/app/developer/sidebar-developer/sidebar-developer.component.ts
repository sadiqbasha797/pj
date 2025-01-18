import { Component, Input, Output, EventEmitter, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-sidebar-developer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar-developer.component.html',
  styleUrls: ['./sidebar-developer.component.css']
})
export class SidebarDeveloperComponent implements OnInit {
  @Input() collapsed = false;
  @Output() closeSidebar = new EventEmitter<void>();
  isMobile = false;
  isDarkMode = true;

  constructor(private themeService: ThemeService) {
    this.themeService.darkMode$.subscribe(
      isDark => this.isDarkMode = isDark
    );
  }

  ngOnInit() {
    this.checkScreenSize();
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.checkScreenSize();
  }

  onCloseSidebar() {
    this.closeSidebar.emit();
  }

  private checkScreenSize() {
    this.isMobile = window.innerWidth < 768;
  }
}
