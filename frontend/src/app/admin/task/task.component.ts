import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
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
  description: string;
  startDate: string;
  endDate: string;
  projectId: Project;
  participants: Participant[];
  status: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  relatedDocuments?: string[];
  updates?: TaskUpdate[];
  finalResult?: FinalResult;
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
    description: '',
    startDate: '',
    endDate: '',
    projectId: { _id: '', title: '' },
    participants: [],
    status: 'Assigned',
    relatedDocuments: []
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
  selectedDocuments: File[] = [];
  deletedDocuments: string[] = [];
  selectedFiles: File[] = [];

  @ViewChild('modalContent') modalContent!: ElementRef;
  @ViewChild('viewModalContent') viewModalContent!: ElementRef;
  @ViewChild('updateModalContent') updateModalContent!: ElementRef;
  @ViewChild('finalResultModalContent') finalResultModalContent!: ElementRef;

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

  openModal(task: Task | null = null) {
    // Close view modal first if it's open
    if (this.viewingTask) {
      this.closeViewModal();
      // Wait for view modal animation to complete
      setTimeout(() => {
        this.setupEditModal(task);
      }, 300);
    } else {
      this.setupEditModal(task);
    }
  }

  private setupEditModal(task: Task | null) {
    this.editingTask = task;
    if (task) {
      this.newTask = { ...task };
      this.selectedProjectId = typeof task.projectId === 'object' ? task.projectId._id : task.projectId;
      this.onProjectSelect();
    } else {
      this.resetTaskForm();
    }
    this.showModal = true;
  }

  resetTaskForm() {
    this.newTask = {
      taskName: '',
      description: '',
      startDate: '',
      endDate: '',
      projectId: { _id: '', title: '' },
      participants: [],
      status: 'Assigned',
      relatedDocuments: []
    };
    this.selectedProjectId = '';
    this.assignedDevelopers = [];
    this.selectedDocuments = [];
    this.deletedDocuments = [];
    this.editingTask = null;
  }

  closeModal() {
    // Add fadeOut animation class
    const modalElement = document.querySelector('.animate__fadeInDown');
    if (modalElement) {
      modalElement.classList.remove('animate__fadeInDown');
      modalElement.classList.add('animate__fadeOutUp');
      
      // Wait for animation to complete before hiding
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

    // Convert participants to array of participantId objects and append as string
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

    // Handle deleted documents if editing
    if (this.editingTask && this.deletedDocuments.length > 0) {
      formData.append('deletedDocuments', JSON.stringify(this.deletedDocuments));
    }

    if (this.editingTask) {
      this.adminService.updateTask(this.editingTask._id, formData).subscribe({
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
      this.adminService.addTask(formData).subscribe({
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
      description: '',
      startDate: '',
      endDate: '',
      projectId: { _id: '', title: '' },
      participants: [],
      status: 'Assigned',
      relatedDocuments: []
    };
    this.selectedProjectId = '';
    this.assignedDevelopers = [];
    this.selectedDocuments = [];
    this.deletedDocuments = [];
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
    // Add fadeOut animation class
    const modalElement = document.querySelector('.animate__fadeInDown');
    if (modalElement) {
      modalElement.classList.remove('animate__fadeInDown');
      modalElement.classList.add('animate__fadeOutUp');
      
      // Wait for animation to complete before hiding
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
    this.adminService.addTaskUpdate(this.viewingTask._id, formData).subscribe({
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

  deleteUpdate(taskId: string, updateId: string) {
    console.log('Deleting update:', { taskId, updateId, update: this.viewingTask?.updates?.find(u => u.updateId === updateId) });
    
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
        this.adminService.deleteTaskUpdate(taskId, updateId).subscribe({
          next: (response) => {
            if (this.viewingTask && this.viewingTask.updates) {
              this.viewingTask.updates = this.viewingTask.updates.filter(
                update => update.updateId !== updateId
              );
            }
            this.showSuccessAlert('Update deleted successfully');
            this.loaderService.hide();
          },
          error: (error) => {
            console.error('Error deleting update:', error);
            this.showErrorAlert('Failed to delete update');
            this.loaderService.hide();
          }
        });
      }
    });
  }

  openFinalResultModal() {
    this.showFinalResultModal = true;
    this.finalResult = { 
      description: '',
      images: []
    };
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

  onResultImagesSelected(event: any) {
    const files = event.target.files;
    if (files) {
      this.finalResult.images = Array.from(files);
    }
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
    this.adminService.addFinalResult(this.viewingTask._id, formData).subscribe({
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
      confirmButtonText: 'Close'
    });
  }

  closeModalOnOutsideClick(event: MouseEvent, modalContent: HTMLElement) {
    if (!(modalContent as any).contains(event.target)) {
      // Check which modal is open and close it
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

  onDocumentsSelected(event: any) {
    const files = event.target.files;
    if (files) {
      this.selectedDocuments = Array.from(files);
    }
  }

  removeDocument(docUrl: string) {
    if (this.editingTask) {
      this.editingTask.relatedDocuments = this.editingTask.relatedDocuments?.filter(doc => doc !== docUrl);
      this.deletedDocuments.push(docUrl);
    }
  }

  onFileSelected(event: any) {
    const files: FileList = event.target.files;
    if (files) {
      this.selectedFiles = Array.from(files);
    }
  }
}
