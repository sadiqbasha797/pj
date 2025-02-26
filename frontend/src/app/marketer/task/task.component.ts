import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MarketerService } from '../../services/marketer.services';
import { Router } from '@angular/router';

interface Task {
  _id: string;
  taskName: string;
  taskDescription: string;
  priority: string;
  status: string;
  startDate: string;
  endDate: string;
  leads: number;
  budget: number;
  projectId: {
    title: string;
    description: string;
  };
  assignedTo: Array<{
    id: string;
    role: string;
  }>;
}

interface Project {
  title: string;
  description: string;
  tasks: Task[];
  isExpanded: boolean;
}

@Component({
  selector: 'app-task',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './task.component.html',
  styleUrl: './task.component.css'
})
export class TaskComponent implements OnInit {
  projects: Project[] = [];
  tasks: Task[] = [];
  loading: boolean = false;
  error: string | null = null;

  constructor(
    private marketerService: MarketerService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks(): void {
    this.loading = true;
    this.error = null;

    this.marketerService.getAssignedMarketingTasks().subscribe({
      next: (response: { tasks: Task[] }) => {
        this.tasks = response.tasks;

        // Group tasks by project
        const groupedTasks = response.tasks.reduce((acc: { [key: string]: Task[] }, task: Task) => {
          const projectTitle = task.projectId.title;
          if (!acc[projectTitle]) {
            acc[projectTitle] = [];
          }
          acc[projectTitle].push(task);
          return acc;
        }, {});

        // Convert to projects array with proper typing
        this.projects = Object.entries(groupedTasks).map(([title, tasks]): Project => ({
          title,
          description: tasks[0].projectId.description,
          tasks: tasks,
          isExpanded: false
        }));

        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load tasks. Please try again later.';
        this.loading = false;
        console.error('Error loading tasks:', error);
      }
    });
  }

  toggleProject(project: Project): void {
    project.isExpanded = !project.isExpanded;
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'in-progress':
        return 'status-in-progress';
      case 'completed':
        return 'status-completed';
      case 'pending':
        return 'status-pending';
      default:
        return '';
    }
  }

  getPriorityClass(priority: string): string {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'priority-high';
      case 'medium':
        return 'priority-medium';
      case 'low':
        return 'priority-low';
      default:
        return '';
    }
  }

  viewTaskUpdates(taskId: string) {
    console.log('Navigating to updates for task:', taskId);
    this.router.navigate(['/marketer/task-updates'], {
      queryParams: { taskId: taskId }
    });
  }
}
