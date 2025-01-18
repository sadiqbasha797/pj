import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClientService } from '../../services/client.service';

interface Participant {
  participantId: {
    _id: string;
    email: string;
  };
  _id: string;
}

interface TaskUpdate {
  content: string;
  updatedBy: {
    _id: string;
    email: string;
  } | null;
  updatedByName: string;
  updatedByModel: string;
  relatedMedia: string[];
  _id: string;
  updateId: string;
  timestamp: string;
}

interface FinalResult {
  description?: string;
  resultImages: string[];
  updatedBy?: string;
}

interface Task {
  _id: string;
  taskName: string;
  startDate: string;
  endDate: string;
  status: string;
  description?: string;
  participants: Participant[];
  updates: TaskUpdate[];
  finalResult: FinalResult;
  relatedDocuments: string[];
  createdAt: string;
  updatedAt: string;
}

interface Project {
  _id: string;
  title: string;
  description: string;
  deadline: string;
  status: string;
  assignedTo: Array<{ _id: string; email: string; }>;
  tasks: Task[];
  updatedAt: string;
}

@Component({
  selector: 'app-projects-client',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './projects-client.component.html'
})
export class ProjectsClientComponent implements OnInit {
  projects: Project[] = [];
  selectedProject: Project | null = null;
  showModal = false;
  selectedTask: Task | null = null;
  window = window; // Add window reference for template

  constructor(private clientService: ClientService) {}

  ngOnInit() {
    this.loadProjects();
  }

  private loadProjects() {
    this.clientService.getProjects().subscribe({
      next: (response) => {
        if (response.success) {
          this.projects = response.projects;
        }
      },
      error: (error) => {
        console.error('Error loading projects:', error);
      }
    });
  }

  openProjectModal(project: Project) {
    this.selectedProject = project;
    this.showModal = true;
  }

  closeModal() {
    this.selectedProject = null;
    this.showModal = false;
    this.selectedTask = null;
  }

  viewTaskDetails(task: Task) {
    this.selectedTask = task;
  }

  backToProject() {
    this.selectedTask = null;
  }

  getTotalUpdates(project: Project): number {
    return project.tasks.reduce((total, task) => total + task.updates.length, 0);
  }

  getTaskMetrics(project: Project): { total: number; completed: number; percentage: number } {
    const total = project.tasks.length;
    const completed = project.tasks.filter(task => task.status === 'Completed').length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, percentage };
  }

  getDeadlineStatus(deadline: string): { daysLeft: number; isOverdue: boolean } {
    const deadlineDate = new Date(deadline);
    const today = new Date();
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return {
      daysLeft: Math.abs(diffDays),
      isOverdue: diffDays < 0
    };
  }
}
