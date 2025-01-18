import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DeveloperService } from '../../services/developer.service';
import { ThemeService } from '../../services/theme.service';

interface Project {
  _id: string;
  title: string;
  description: string;
  deadline: string;
  status: string;
  relatedDocs: string[];
}

@Component({
  selector: 'app-projects-developer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './projects-developer.component.html',
  styleUrl: './projects-developer.component.css'
})
export class ProjectsDeveloperComponent implements OnInit {
  projects: Project[] = [];
  statusOptions = ['Assigned', 'In-Progress', 'Testing', 'Completed'];
  isDarkMode = true;

  constructor(
    private developerService: DeveloperService,
    private themeService: ThemeService
  ) {
    this.themeService.darkMode$.subscribe(
      isDark => this.isDarkMode = isDark
    );
  }

  ngOnInit() {
    this.loadProjects();
  }

  loadProjects() {
    this.developerService.getAssignedProjects().subscribe({
      next: (data) => {
        this.projects = data;
      },
      error: (error) => {
        console.error('Error loading projects:', error);
      }
    });
  }

  updateStatus(projectId: string, newStatus: string) {
    this.developerService.updateProjectStatus(projectId, newStatus).subscribe({
      next: () => {
        this.loadProjects(); // Reload projects after update
      },
      error: (error) => {
        console.error('Error updating project status:', error);
      }
    });
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString();
  }
}
