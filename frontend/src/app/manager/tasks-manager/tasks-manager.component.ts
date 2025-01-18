import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ManagerService } from '../../services/manager.service';
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

export interface Task {
  _id: string;
  taskName: string;
  description: string;
  startDate: string;
  endDate: string;
  projectId: Project;
  participants: Participant[];
  status: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  updates?: TaskUpdate[];
  finalResult?: FinalResult;
  relatedDocuments?: string[];
}

interface Developer {
  _id: string;
  username: string;
  email: string;
  skills: string[];
}

interface TaskUpdate {
  _id?: string;
  updateId: string;
  content: string;
  updatedBy: string;
  updatedByName: string;
  updatedByModel: string;
  relatedMedia: string[];
  timestamp: string;
}

interface FinalResult {
  description: string;
  resultImages?: string[];
  images?: File[];
  updatedBy?: string;
  updatedByName?: string;
  updatedByModel?: string;
}

interface ManagerProfile {
  _id: string;
  username: string;
  email: string;
  teamSize: number;
  developers: {
    developerId: string;
    developerName: string;
    assignedOn: string;
    _id: string;
  }[];
}

@Component({
  selector: 'app-tasks-manager',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tasks-manager.component.html',
  styleUrls: ['./tasks-manager.component.css']
})
export class TasksManagerComponent implements OnInit {
  tasks: Task[] = [];
  assignedDevelopers: Developer[] = [];
  projects: Project[] = [];
  newTask: Omit<Task, '_id' | 'createdBy' | 'createdAt' | 'updatedAt'> = {
    taskName: '',
    description: '',
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
  showUpdateModal = false;
  showFinalResultModal = false;
  newUpdate: { content: string; media?: File[] } = { content: '' };
  finalResult: FinalResult = {
    description: '',
    images: []
  };
  managerProfile: ManagerProfile | null = null;
  managerDeveloperIds: string[] = [];
  selectedFiles: File[] = [];

  @ViewChild('modalContent') modalContent!: ElementRef;
  @ViewChild('viewModalContent') viewModalContent!: ElementRef;
  @ViewChild('updateModalContent') updateModalContent!: ElementRef;
  @ViewChild('finalResultModalContent') finalResultModalContent!: ElementRef;

  constructor(
    private managerService: ManagerService,
    private loaderService: LoaderService
  ) {}

  ngOnInit() {
    this.loadManagerProfile();
    this.loadProjects();
  }

  loadManagerProfile() {
    this.loaderService.show();
    this.managerService.getManagerProfile().subscribe({
      next: (profile) => {
        this.managerProfile = profile;
        // Extract developer IDs for easy comparison
        this.managerDeveloperIds = profile.developers.map(dev => dev.developerId);
        this.loadTasks();
      },
      error: (error) => {
        console.error('Error loading manager profile:', error);
        this.loaderService.hide();
        this.showErrorAlert('Unable to load manager profile');
      }
    });
  }

  loadTasks() {
    this.managerService.getAllTasks().subscribe({
      next: (tasks) => {
        // Filter tasks where either:
        // 1. Task participants include manager's developers
        // 2. Manager is a participant
        this.tasks = tasks.filter((task: { participants: any[]; }) => {
          const participantIds = task.participants.map(p => p.participantId._id);
          
          // Check if any of the manager's developers are participants
          const hasManagerDevelopers = participantIds.some(id => 
            this.managerDeveloperIds.includes(id)
          );

          // Check if manager is a participant
          const isManagerParticipant = participantIds.includes(this.managerProfile?._id);

          return hasManagerDevelopers || isManagerParticipant;
        });
        this.loaderService.hide();
      },
      error: (error) => {
        console.error('Error loading tasks:', error);
        this.loaderService.hide();
        this.showErrorAlert('Unable to load tasks');
      }
    });
  }

  loadProjects() {
    this.loaderService.show();
    const managerId = localStorage.getItem('userId'); // Get manager ID from localStorage
    
    this.managerService.getProjects().subscribe({
      next: (response) => {
        // Filter projects to only show those created by the manager
        this.projects = response.filter((project: { createdBy: string }) => 
          project.createdBy === managerId
        );
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
    if (!this.selectedProjectId || !this.managerProfile) return;
    
    const developerIds = this.managerProfile.developers.map(dev => dev.developerId);
    this.managerService.getAllDevelopers().subscribe({
      next: (response: Developer[]) => {
        // Filter developers who are both assigned to the manager and the project
        this.assignedDevelopers = response.filter(dev => 
          developerIds.includes(dev._id)
        );
        this.loaderService.hide();
      },
      error: (error) => {
        console.error('Error loading developers:', error);
        this.loaderService.hide();
        this.showErrorAlert('Error loading developers. Please try again.');
      }
    });
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
    const modalElement = document.querySelector('.animate__fadeInDown');
    if (modalElement) {
      modalElement.classList.remove('animate__fadeInDown');
      modalElement.classList.add('animate__fadeOutUp');
      
      setTimeout(() => {
        this.showModal = false;
        this.resetNewTask();
      }, 300);
    } else {
      this.showModal = false;
      this.resetNewTask();
    }
  }

  addOrUpdateTask() {
    this.loaderService.show();
    const formData = new FormData();
    
    // Append basic task data
    formData.append('taskName', this.newTask.taskName);
    formData.append('description', this.newTask.description);
    formData.append('startDate', this.newTask.startDate);
    formData.append('endDate', this.newTask.endDate);
    formData.append('projectId', this.selectedProjectId);
    formData.append('status', this.newTask.status);

    // Convert participants to array of participantId objects
    const participants = this.newTask.participants.map(p => ({
      participantId: p.participantId._id
    }));
    
    formData.append('participants', JSON.stringify(participants));

    // Handle file uploads
    if (this.selectedFiles && this.selectedFiles.length > 0) {
      for (let i = 0; i < this.selectedFiles.length; i++) {
        formData.append('relatedDocs', this.selectedFiles[i]);
      }
    }

    if (this.editingTask) {
      this.managerService.updateTask(this.editingTask._id, formData).subscribe({
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
      this.managerService.addTask(formData).subscribe({
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

  deleteTask(taskId: string, createdBy: string) {
    if (createdBy !== this.managerProfile?._id) {
      this.showErrorAlert('You can only delete tasks that you created.');
      return;
    }

    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#16a34a',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.loaderService.show();
        this.managerService.deleteTask(taskId).subscribe({
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
      description: '',
      startDate: '',
      endDate: '',
      projectId: { _id: '', title: '' },
      participants: [],
      status: 'Assigned'
    };
    this.selectedProjectId = '';
    this.assignedDevelopers = [];
    this.selectedFiles = [];
  }

  onProjectSelect() {
    if (!this.selectedProjectId) return;
    
    const selectedProject = this.projects.find(p => p._id === this.selectedProjectId);
    if (selectedProject) {
      this.newTask.projectId = {
        _id: selectedProject._id,
        title: selectedProject.title
      };
      this.loadAssignedDevelopers();
    }
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

  getParticipantUsername(participant: Participant | string): string {
    if (typeof participant === 'string') {
      return participant;
    } else if (participant && typeof participant === 'object' && 'participantId' in participant) {
      return participant.participantId.username;
    }
    return 'Unknown Participant';
  }

  viewTask(task: Task) {
    this.viewingTask = { ...task };
    this.managerService.getTaskById(task._id).subscribe({
      next: (response) => {
        this.viewingTask = response;
      },
      error: (error) => {
        console.error('Error loading task details:', error);
        this.showErrorAlert('Error loading task details');
      }
    });
  }

  closeViewModal() {
    const modalElement = document.querySelector('.animate__fadeInDown');
    if (modalElement) {
      modalElement.classList.remove('animate__fadeInDown');
      modalElement.classList.add('animate__fadeOutUp');
      
      setTimeout(() => {
        this.viewingTask = null;
      }, 300);
    } else {
      this.viewingTask = null;
    }
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
      confirmButtonColor: '#16a34a',
      confirmButtonText: 'OK'
    });
  }

  private showErrorAlert(message: string) {
    Swal.fire({
      title: 'Error!',
      text: message,
      icon: 'error', 
      confirmButtonColor: '#dc2626',
      confirmButtonText: 'OK'
    });
  }

  openUpdateModal() {
    this.showUpdateModal = true;
    this.newUpdate = { content: '' };
  }

  closeUpdateModal() {
    const modalElement = document.querySelector('.animate__fadeInDown');
    if (modalElement) {
      modalElement.classList.remove('animate__fadeInDown');
      modalElement.classList.add('animate__fadeOutUp');
      
      setTimeout(() => {
        this.showUpdateModal = false;
      }, 300);
    } else {
      this.showUpdateModal = false;
    }
  }

  onUpdateMediaSelected(event: any) {
    this.newUpdate.media = Array.from(event.target.files);
  }

  submitUpdate() {
    if (!this.viewingTask) return;

    const formData = new FormData();
    formData.append('content', this.newUpdate.content);
    
    if (this.newUpdate.media) {
      this.newUpdate.media.forEach((file) => {
        formData.append('media', file);
      });
    }

    this.loaderService.show();
    this.managerService.addTaskUpdate(this.viewingTask._id, formData).subscribe({
      next: (response) => {
        this.viewingTask = response.task;
        this.closeUpdateModal();
        this.showSuccessAlert('Task update added successfully');
        this.loaderService.hide();
      },
      error: (error) => {
        console.error('Error adding task update:', error);
        this.showErrorAlert('Failed to add task update');
        this.loaderService.hide();
      }
    });
  }

  openFinalResultModal() {
    this.showFinalResultModal = true;
    this.finalResult = { description: '', images: [] };
  }

  closeFinalResultModal() {
    const modalElement = document.querySelector('.animate__fadeInDown');
    if (modalElement) {
      modalElement.classList.remove('animate__fadeInDown');
      modalElement.classList.add('animate__fadeOutUp');
      
      setTimeout(() => {
        this.showFinalResultModal = false;
      }, 300);
    } else {
      this.showFinalResultModal = false;
    }
  }

  onFinalResultImagesSelected(event: any) {
    this.finalResult.images = Array.from(event.target.files);
  }

  submitFinalResult() {
    if (!this.viewingTask) return;

    const formData = new FormData();
    formData.append('description', this.finalResult.description);
    
    if (this.finalResult.images) {
      this.finalResult.images.forEach((file) => {
        formData.append('resultImages', file);
      });
    }

    this.loaderService.show();
    this.managerService.addFinalResult(this.viewingTask._id, formData).subscribe({
      next: (response) => {
        this.viewingTask = response.task;
        this.closeFinalResultModal();
        this.showSuccessAlert('Final result added successfully');
        this.loaderService.hide();
      },
      error: (error) => {
        console.error('Error adding final result:', error);
        this.showErrorAlert('Failed to add final result');
        this.loaderService.hide();
      }
    });
  }

  ImageViewer(imageUrl: string) {
    Swal.fire({
      imageUrl,
      imageAlt: 'Task Image',
      width: '80%',
      confirmButtonColor: '#16a34a',
      confirmButtonText: 'Close'
    });
  }

  closeModalOnOutsideClick(event: MouseEvent, modalContent: HTMLElement) {
    if (!(modalContent as any).contains(event.target)) {
      if (this.showModal) {
        this.closeModal();
      } else if (this.showUpdateModal) {
        this.closeUpdateModal();
      } else if (this.showFinalResultModal) {
        this.closeFinalResultModal();
      } else if (this.viewingTask) {
        this.closeViewModal();
      }
    }
  }

  editTask(task: Task) {
    if (!this.isTaskCreatedByManager(task)) {
      this.showErrorAlert('You can only edit tasks that you created.');
      return;
    }

    this.editingTask = task;
    this.newTask = {
      taskName: task.taskName,
      description: task.description,
      startDate: task.startDate,
      endDate: task.endDate,
      projectId: { _id: task.projectId._id, title: task.projectId.title },
      participants: [...task.participants],
      status: task.status
    };
    this.selectedProjectId = task.projectId._id;
    this.loadAssignedDevelopers();
    this.showModal = true;
  }

  isTaskCreatedByManager(task: Task): boolean {
    return task.createdBy === this.managerProfile?._id;
  }

  onFileSelected(event: any) {
    const files: FileList = event.target.files;
    if (files) {
      this.selectedFiles = Array.from(files);
    }
  }
}