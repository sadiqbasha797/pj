import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';
import { LoaderService } from '../../services/loader.service';
import Swal from 'sweetalert2';

interface Project {
  _id: string;
  title: string;
}

interface Participant {
  _id: string;
  participantId: {
    _id: string;
    username: string;
  };
}

interface Task {
  _id: string;
  taskName: string;
  startDate: string;
  endDate: string;
  projectId: Project;
  participants: Participant[];
  status: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface Developer {
  _id: string;
  username: string;
  email: string;
  skills: string[];
}

@Component({
  selector: 'app-task',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.css']
})
export class TaskComponent implements OnInit {
  tasks: Task[] = [];
  assignedDevelopers: Developer[] = [];
  projects: Project[] = [];
  newTask: Omit<Task, '_id' | 'createdBy' | 'createdAt' | 'updatedAt'> = {
    taskName: '',
    startDate: '',
    endDate: '',
    projectId: { _id: '', title: '' },
    participants: [],
    status: 'Assigned'
  };
  selectedProjectId: string = '';
  showModal = false;
  editingTask: Task | null = null;
  viewingTask: Task | null = null;
  hoveredTaskId: string | null = null;

  constructor(
    private adminService: AdminService,
    private loaderService: LoaderService
  ) {}

  ngOnInit() {
    this.loadTasks();
    this.loadProjects();
  }

  loadTasks() {
    this.loaderService.show();
    this.adminService.getAllTasks().subscribe({
      next: (response) => {
        this.tasks = response;
        this.loaderService.hide();
      },
      error: (error) => {
        console.error('Error loading tasks:', error);
        this.loaderService.hide();
        this.showErrorAlert('Unable to load tasks. Please try again later.');
      }
    });
  }

  loadProjects() {
    this.loaderService.show();
    this.adminService.getAllProjects().subscribe({
      next: (response) => {
        this.projects = response;
        this.loaderService.hide();
      },
      error: (error) => {
        console.error('Error loading projects:', error);
        this.loaderService.hide();
        this.showErrorAlert('Unable to load projects. Please try again later.');
      }
    });
  }

  loadAssignedDevelopers() {
    if (this.selectedProjectId) {
      this.loaderService.show();
      this.adminService.getAssignedDevelopers(this.selectedProjectId).subscribe({
        next: (developers) => {
          this.assignedDevelopers = developers;
          this.loaderService.hide();
        },
        error: (error) => {
          console.error('Error loading assigned developers:', error);
          this.loaderService.hide();
          this.showErrorAlert('Unable to load assigned developers. Please try again.');
        }
      });
    }
  }

  openModal(task?: Task) {
    if (task) {
      this.editingTask = task;
      this.newTask = { ...task };
      this.selectedProjectId = task.projectId._id;
      this.loadAssignedDevelopers();
    } else {
      this.editingTask = null;
      this.resetNewTask();
    }
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.resetNewTask();
  }

  addOrUpdateTask() {
    this.loaderService.show();
    const taskData = {
      ...this.newTask,
      projectId: this.selectedProjectId,
      participants: this.newTask.participants.map(p => ({ participantId: p.participantId._id }))
    };

    if (this.editingTask) {
      this.adminService.updateTask(this.editingTask._id, taskData).subscribe({
        next: (response) => {
          const index = this.tasks.findIndex(t => t._id === this.editingTask!._id);
          if (index !== -1) {
            this.tasks[index] = response;
          }
          this.loaderService.hide();
          this.showSuccessAlert('Task updated successfully!');
          this.closeModal();
        },
        error: (error) => {
          console.error('Error updating task:', error);
          this.loaderService.hide();
          this.showErrorAlert('Error updating task. Please try again.');
        }
      });
    } else {
      this.adminService.addTask(taskData).subscribe({
        next: (response) => {
          this.tasks.push(response);
          this.loaderService.hide();
          this.showSuccessAlert('Task added successfully!');
          this.closeModal();
        },
        error: (error) => {
          console.error('Error adding task:', error);
          this.loaderService.hide();
          this.showErrorAlert('Error adding task. Please try again.');
        }
      });
    }
  }

  deleteTask(taskId: string) {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.loaderService.show();
        this.adminService.deleteTask(taskId).subscribe({
          next: () => {
            this.tasks = this.tasks.filter(t => t._id !== taskId);
            this.loaderService.hide();
            this.showSuccessAlert('Task deleted successfully!');
          },
          error: (error) => {
            console.error('Error deleting task:', error);
            this.loaderService.hide();
            this.showErrorAlert('Error deleting task. Please try again.');
          }
        });
      }
    });
  }

  resetNewTask() {
    this.newTask = {
      taskName: '',
      startDate: '',
      endDate: '',
      projectId: { _id: '', title: '' },
      participants: [],
      status: 'Assigned'
    };
    this.selectedProjectId = '';
    this.assignedDevelopers = [];
  }

  onProjectSelect() {
    this.newTask.projectId._id = this.selectedProjectId;
    this.loadAssignedDevelopers();
  }

  toggleParticipant(developer: Developer) {
    const index = this.newTask.participants.findIndex(p => p.participantId._id === developer._id);
    if (index > -1) {
      this.newTask.participants.splice(index, 1);
    } else {
      this.newTask.participants.push({
        _id: '',
        participantId: { _id: developer._id, username: developer.username }
      });
    }
  }

  isParticipantSelected(developerId: string): boolean {
    return this.newTask.participants.some(p => p.participantId._id === developerId);
  }

  getProjectTitle(projectId: string | Project): string {
    if (typeof projectId === 'string') {
      const project = this.projects.find(p => p._id === projectId);
      return project ? project.title : 'Unknown Project';
    } else if (projectId && typeof projectId === 'object' && 'title' in projectId) {
      return projectId.title;
    }
    return 'Unknown Project';
  }

  getParticipantUsername(participant: Participant | string): string {
    if (typeof participant === 'string') {
      return participant;
    } else if (participant && typeof participant === 'object' && 'participantId' in participant) {
      return participant.participantId.username;
    }
    return 'Unknown Participant';
  }

  viewTask(task: Task) {
    this.viewingTask = task;
  }

  closeViewModal() {
    this.viewingTask = null;
  }

  setHoveredTask(taskId: string | null) {
    this.hoveredTaskId = taskId;
  }

  isTaskHovered(taskId: string): boolean {
    return this.hoveredTaskId === taskId;
  }

  private showSuccessAlert(message: string) {
    Swal.fire({
      title: 'Success!',
      text: message,
      icon: 'success',
      confirmButtonText: 'OK'
    });
  }

  private showErrorAlert(message: string) {
    Swal.fire({
      title: 'Error!',
      text: message,
      icon: 'error',
      confirmButtonText: 'OK'
    });
  }
}
