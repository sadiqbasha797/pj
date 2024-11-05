import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-page-header',
  templateUrl: './page-header.component.html',
  standalone: true,
  imports: [CommonModule]
})
export class PageHeaderComponent {
  @Input() title!: string;
  @Input() subtitle!: string;
  @Input() icon!: string;
  @Input() type: 'dashboard' | 'projects' | 'tasks' | 'calendar' | 'users' | 'chat' | 'leave' = 'dashboard';

  getGradientClass(): string {
    const gradients = {
      dashboard: 'bg-gradient-to-r from-indigo-400 via-blue-500 to-blue-600',
      projects: 'bg-gradient-to-r from-violet-400 via-purple-500 to-purple-600',
      tasks: 'bg-gradient-to-r from-teal-400 via-emerald-500 to-green-600',
      calendar: 'bg-gradient-to-r from-cyan-400 via-blue-500 to-blue-600',
      users: 'bg-gradient-to-r from-emerald-400 via-green-500 to-green-600',
      chat: 'bg-gradient-to-r from-pink-400 via-rose-500 to-rose-600',
      leave: 'bg-gradient-to-r from-orange-400 via-amber-500 to-yellow-600'
    };
    return gradients[this.type];
  }

  getIconContainerClass(): string {
    return 'bg-white/20 p-2 rounded-lg backdrop-blur-sm';
  }

  getSubtitleClass(): string {
    const colors = {
      dashboard: 'text-indigo-100',
      projects: 'text-violet-100',
      tasks: 'text-teal-100',
      calendar: 'text-cyan-100',
      users: 'text-emerald-100',
      chat: 'text-pink-100',
      leave: 'text-orange-100'
    };
    return colors[this.type];
  }
} 