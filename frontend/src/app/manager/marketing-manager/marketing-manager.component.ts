import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ManagerService } from '../../services/manager.service';
import { Router } from '@angular/router';

interface TeamMember {
  _id: string;
  username: string;
  email: string;
  skills: string[];
  role: string;
  image: string | null;
}

interface MarketingTask {
  _id: string;
  taskName: string;
  taskDescription: string;
  projectId: any;
  assignedTo: {
    id: string;
    role: string;
    userDetails?: TeamMember;
  }[];
  priority: string;
  startDate: Date;
  endDate: Date;
  leads: number;
  status: string;
  relatedDocs: string[];
}

interface TaskUpdate {
  _id: string;
  taskId: string;
  description: string;
  startDate: string;
  endDate: string;
  attachments: string[];
  leadsInfo: {
    name: string;
    description: string;
    contact: string;
    email: string;
  }[];
  updatedBy: {
    id: string;
    name: string;
  };
  comments: {
    _id: string;
    text: string;
    createdBy: string;
    name: string;
    role: string;
    createdAt: string;
  }[];
  createdAt: string;
}

@Component({
  selector: 'app-marketing-manager',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './marketing-manager.component.html',
  styleUrl: './marketing-manager.component.css'
})
export class MarketingManagerComponent implements OnInit {
  taskForm: FormGroup;
  tasks: MarketingTask[] = [];
  digitalMarketingMembers: TeamMember[] = [];
  contentCreatorMembers: TeamMember[] = [];
  projects: any[] = [];
  selectedTask: MarketingTask | null = null;
  isEditing = false;
  managerDigitalMarketers: string[] = [];
  managerContentCreators: string[] = [];
  showModal = false;
  showUpdatesModal = false;
  taskUpdates: TaskUpdate[] = [];
  newComments: { [key: string]: string } = {};
  hoveredTaskId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private managerService: ManagerService,
    private router: Router
  ) {
    this.taskForm = this.fb.group({
      taskName: ['', Validators.required],
      taskDescription: ['', Validators.required],
      projectId: ['', Validators.required],
      digitalMarketers: [[]],
      contentCreators: [[]],
      priority: ['medium'],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      status: ['pending'],
      relatedDocs: [[]]
    });
  }

  ngOnInit() {
    this.loadManagerProfile();
    this.loadTeamMembers();
    this.loadProjects();
  }

  loadManagerProfile() {
    this.managerService.getManagerProfile().subscribe({
      next: (profile) => {
        this.managerDigitalMarketers = profile.digitalMarketingRoles.map(role => role.roleId);
        this.managerContentCreators = profile.contentCreators.map(role => role.roleId);
        this.loadTasks();
      },
      error: (error) => console.error('Error loading manager profile:', error)
    });
  }

  loadTasks() {
    this.managerService.getAllMarketingTasks().subscribe({
      next: (tasks) => {
        this.tasks = tasks.filter((task: { assignedTo: any[]; }) => {
          return task.assignedTo.some(member => 
            (member.role === 'DigitalMarketingRole' && this.managerDigitalMarketers.includes(member.id)) ||
            (member.role === 'ContentCreator' && this.managerContentCreators.includes(member.id))
          );
        });
      },
      error: (error) => console.error('Error loading tasks:', error)
    });
  }

  loadTeamMembers() {
    this.managerService.getAllDigitalMarketingMembers().subscribe({
      next: (response) => {
        this.digitalMarketingMembers = response.data;
      },
      error: (error) => console.error('Error loading digital marketing members:', error)
    });

    this.managerService.getAllContentCreatorMembers().subscribe({
      next: (response) => {
        this.contentCreatorMembers = response.data;
      },
      error: (error) => console.error('Error loading content creators:', error)
    });
  }

  loadProjects() {
    this.managerService.getProjects().subscribe({
      next: (projects) => {
        this.projects = projects;
      },
      error: (error) => console.error('Error loading projects:', error)
    });
  }

  onSubmit() {
    if (this.taskForm.valid) {
      const formData = new FormData();
      const formValue = this.taskForm.value;

      const assignedTo = [
        ...(formValue.digitalMarketers || []),
        ...(formValue.contentCreators || [])
      ];

      delete formValue.digitalMarketers;
      delete formValue.contentCreators;

      formValue.assignedTo = assignedTo;

      Object.keys(formValue).forEach(key => {
        if (key === 'assignedTo') {
          formData.append(key, JSON.stringify(formValue[key]));
        } else {
          formData.append(key, formValue[key]);
        }
      });

      if (this.isEditing && this.selectedTask) {
        this.managerService.updateMarketingTask(this.selectedTask._id, formData).subscribe({
          next: () => {
            this.loadTasks();
            this.closeModal();
          },
          error: (error) => console.error('Error updating task:', error)
        });
      } else {
        this.managerService.createMarketingTask(formData).subscribe({
          next: () => {
            this.loadTasks();
            this.closeModal();
          },
          error: (error) => console.error('Error creating task:', error)
        });
      }
    }
  }

  editTask(task: MarketingTask) {
    this.selectedTask = task;
    this.isEditing = true;

    const digitalMarketers = task.assignedTo.filter(member => member.role === 'DigitalMarketingRole');
    const contentCreators = task.assignedTo.filter(member => member.role === 'ContentCreator');

    this.taskForm.patchValue({
      taskName: task.taskName,
      taskDescription: task.taskDescription,
      projectId: task.projectId._id,
      digitalMarketers: digitalMarketers,
      contentCreators: contentCreators,
      priority: task.priority,
      startDate: new Date(task.startDate).toISOString().split('T')[0],
      endDate: new Date(task.endDate).toISOString().split('T')[0],
      status: task.status
    });
    
    this.openModal();
  }

  deleteTask(taskId: string) {
    if (confirm('Are you sure you want to delete this task?')) {
      this.managerService.deleteMarketingTask(taskId).subscribe({
        next: () => {
          this.loadTasks();
        },
        error: (error) => console.error('Error deleting task:', error)
      });
    }
  }

  resetForm() {
    this.taskForm.reset({
      priority: 'medium',
      status: 'pending'
    });
    this.selectedTask = null;
    this.isEditing = false;
  }

  openModal() {
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.resetForm();
  }

  viewUpdates(task: MarketingTask) {
    this.router.navigate(['/manager/updates'], {
      queryParams: { taskId: task._id }
    });
  }

  loadTaskUpdates(taskId: string) {
    this.managerService.getTaskUpdates(taskId).subscribe({
      next: (updates) => {
        this.taskUpdates = updates;
      },
      error: (error) => console.error('Error loading task updates:', error)
    });
  }

  closeUpdatesModal() {
    this.showUpdatesModal = false;
    this.selectedTask = null;
    this.taskUpdates = [];
    this.newComments = {};
  }

  addComment(updateId: string) {
    if (!this.newComments[updateId]?.trim()) return;

    this.managerService.addComment(updateId, { text: this.newComments[updateId] }).subscribe({
      next: (response) => {
        const updateIndex = this.taskUpdates.findIndex(u => u._id === updateId);
        if (updateIndex !== -1) {
          this.taskUpdates[updateIndex] = response.taskUpdate;
        }
        this.newComments[updateId] = '';
      },
      error: (error) => console.error('Error adding comment:', error)
    });
  }

  deleteComment(updateId: string, commentId: string) {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    this.managerService.deleteComment(updateId, commentId).subscribe({
      next: (response) => {
        const updateIndex = this.taskUpdates.findIndex(u => u._id === updateId);
        if (updateIndex !== -1) {
          this.taskUpdates[updateIndex] = response.taskUpdate;
        }
      },
      error: (error) => console.error('Error deleting comment:', error)
    });
  }

  setHoveredTask(taskId: string | null) {
    this.hoveredTaskId = taskId;
  }

  isTaskHovered(taskId: string): boolean {
    return this.hoveredTaskId === taskId;
  }
}
