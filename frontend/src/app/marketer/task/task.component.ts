import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MarketerService } from '../../services/marketer.services';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
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
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './task.component.html',
  styleUrl: './task.component.css'
})
export class TaskComponent implements OnInit {
  projects: Project[] = [];
  tasks: Task[] = [];
  loading: boolean = false;
  error: string | null = null;
  taskForm!: FormGroup;
  showTaskForm: boolean = false;
  selectedTask: any = null;
  isEditing: boolean = false;
  currentUserId: string = '';

  constructor(
    private marketerService: MarketerService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.initializeForm();
    this.currentUserId = localStorage.getItem('userId') || '';
  }

  private initializeForm() {
    this.taskForm = this.fb.group({
      taskName: ['', Validators.required],
      taskDescription: ['', Validators.required],
      projectId: ['', Validators.required],
      priority: ['medium', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      status: ['pending', Validators.required],
      budget: [0, [Validators.required, Validators.min(0)]]
    });
  }

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

  toggleTaskForm() {
    this.showTaskForm = !this.showTaskForm;
    if (!this.showTaskForm) {
      this.isEditing = false;
      this.selectedTask = null;
      this.initializeForm();
    }
  }

  createTask() {
    if (this.taskForm.valid) {
      this.loading = true;
      this.marketerService.createMarketingTask(this.taskForm.value).subscribe({
        next: (response) => {
          this.loadTasks();
          this.toggleTaskForm();
          // Show success message
          alert('Task created successfully');
        },
        error: (error) => {
          console.error('Error creating task:', error);
          this.error = 'Failed to create task. Please try again.';
        },
        complete: () => {
          this.loading = false;
        }
      });
    }
  }

  editTask(task: any) {
    if (!this.isTaskCreator(task)) {
      alert('You can only edit tasks that you created');
      return;
    }
    
    this.selectedTask = task;
    this.isEditing = true;
    this.showTaskForm = true;
    this.taskForm.patchValue({
      taskName: task.taskName,
      taskDescription: task.taskDescription,
      projectId: task.projectId._id,
      priority: task.priority,
      startDate: task.startDate.split('T')[0],
      endDate: task.endDate.split('T')[0],
      status: task.status,
      budget: task.budget
    });
  }

  updateTask() {
    if (this.taskForm.valid && this.selectedTask) {
      this.loading = true;
      this.marketerService.updateMarketingTask(this.selectedTask._id, this.taskForm.value).subscribe({
        next: (response) => {
          this.loadTasks();
          this.toggleTaskForm();
          alert('Task updated successfully');
        },
        error: (error) => {
          console.error('Error updating task:', error);
          this.error = 'Failed to update task. Please try again.';
        },
        complete: () => {
          this.loading = false;
        }
      });
    }
  }

  deleteTask(taskId: string) {
    const task = this.tasks.find(t => t._id === taskId);
    
    if (!task || !this.isTaskCreator(task)) {
      alert('You can only delete tasks that you created');
      return;
    }

    if (confirm('Are you sure you want to delete this task?')) {
      this.loading = true;
      this.marketerService.deleteMarketingTask(taskId).subscribe({
        next: () => {
          this.loadTasks();
          alert('Task deleted successfully');
        },
        error: (error) => {
          console.error('Error deleting task:', error);
          this.error = 'Failed to delete task. Please try again.';
        },
        complete: () => {
          this.loading = false;
        }
      });
    }
  }

  isTaskCreator(task: any): boolean {
    return task.createdBy === this.currentUserId;
  }
}
