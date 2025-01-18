import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ManagerService } from '../../services/manager.service';
import { LoaderService } from '../../services/loader.service';
import Swal from 'sweetalert2';

interface Developer {
  _id: string;
  username: string;
  email: string;
  verified: string;
  role: string;
}

interface Project {
  _id: string;
  title: string;
  description: string;
  deadline: string;
  assignedTo: string[];
  relatedDocs: string[];
  status: string;
  createdBy: string;
  lastUpdatedBy: string;
  updatedAt: string;
  createdAt: string;
}

interface ManagerDeveloper {
  developerId: string;
  developerName: string;
  assignedOn: string;
  _id: string;
}

interface ManagerProfile {
  _id: string;
  username: string;
  email: string;
  teamSize: number;
  role: string;
  developers: ManagerDeveloper[];
  mobile: string;
  image: string;
}

interface ProjectStats {
  totalTasks: number;
  completedTasks: number;
  progress: number;
  daysRemaining: number;
  isOverdue: boolean;
}

interface Task {
  _id?: string;
  taskName: string;
  description: string;
  startDate: string;
  endDate: string;
  projectId: {
    _id: string;
    title: string;
  };
  participants: {
    _id?: string;
    participantId: {
      _id: string;
      username: string;
    };
  }[];
  status: string;
  relatedDocuments?: string[];
}

@Component({
  selector: 'app-projects-manager',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './projects-manager.component.html',
  styleUrl: './projects-manager.component.css'
})
export class ProjectsManagerComponent implements OnInit {
  projects: Project[] = [];
  developers: Developer[] = [];
  showModal = false;
  editingProject: Project | null = null;
  newProject: any = {
    title: '',
    description: '',
    deadline: '',
    assignedTo: [],
    relatedDocs: [],
    status: 'Assigned'
  };
  selectedFiles: File[] = [];
  viewingProject: Project | null = null;
  hoveredProjectId: string | null = null;
  managerProfile: ManagerProfile | null = null;
  projectTasks: any[] = [];
  selectedProject: any = null;
  showTasksModal = false;
  showTaskModal = false;
  newTask: Omit<Task, '_id'> = {
    taskName: '',
    description: '',
    startDate: '',
    endDate: '',
    projectId: { _id: '', title: '' },
    participants: [],
    status: 'Assigned'
  };
  assignedDevelopers: any[] = [];
isSidebarCollapsed: any;
isMobile: any;
projectStats: ProjectStats = {
  totalTasks: 0,
  completedTasks: 0,
  progress: 0,
  daysRemaining: 0,
  isOverdue: false
};

  constructor(
    private managerService: ManagerService,
    private loaderService: LoaderService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadManagerProfile();
  }

  loadManagerProfile() {
    this.loaderService.show();
    this.managerService.getProfile().subscribe({
      next: (response) => {
        this.managerProfile = response;
        this.loadProjects();
        this.loadAssignedDevelopers();
      },
      error: (error) => {
        console.error('Error loading manager profile:', error);
        this.loaderService.hide();
        this.showErrorAlert('Error loading profile. Please try again.');
      }
    });
  }

  loadProjects() {
    if (!this.managerProfile) return;

    this.loaderService.show();
    this.managerService.getProjects().subscribe({
      next: (response) => {
        const managerDeveloperIds = this.managerProfile!.developers.map(dev => dev.developerId);
        this.projects = response.filter((project: { assignedTo: any[]; }) => 
          project.assignedTo.some(devId => managerDeveloperIds.includes(devId))
        );
        this.loaderService.hide();
      },
      error: (error) => {
        console.error('Error loading projects:', error);
        this.loaderService.hide();
        this.showErrorAlert('Error loading projects. Please try again.');
      }
    });
  }

  loadAssignedDevelopers() {
    if (!this.managerProfile) return;
    
    const developerIds = this.managerProfile.developers.map(dev => dev.developerId);
    this.managerService.getAllDevelopers().subscribe({
      next: (response: Developer[]) => {
        this.developers = response.filter(dev => 
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

  openModal(project: Project | null = null) {
    if (project && !this.isProjectCreatedByManager(project)) {
      this.showErrorAlert('You can only edit projects that you created.');
      return;
    }

    this.editingProject = project;
    if (project) {
      this.newProject = { ...project };
    } else {
      this.resetNewProject();
    }
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.editingProject = null;
    this.resetNewProject();
  }

  addDeveloper(developerId: string) {
    if (!this.managerProfile) return;

    const isAssignedToManager = this.managerProfile.developers
      .some(dev => dev.developerId === developerId);

    if (developerId && !this.newProject.assignedTo.includes(developerId) && isAssignedToManager) {
      this.newProject.assignedTo.push(developerId);
    } else if (!isAssignedToManager) {
      this.showErrorAlert('You can only assign developers from your team.');
    }
  }

  removeDeveloper(index: number) {
    this.newProject.assignedTo.splice(index, 1);
  }

  onFileSelected(event: any) {
    this.selectedFiles = event.target.files;
  }

  submitProject() {
    if (this.editingProject) {
      this.updateProject();
    } else {
      this.createProject();
    }
  }

  createProject() {
    this.loaderService.show();
    const formData = new FormData();
    formData.append('title', this.newProject.title);
    formData.append('description', this.newProject.description);
    formData.append('deadline', this.newProject.deadline);
    formData.append('assignedTo', JSON.stringify(this.newProject.assignedTo));
    this.selectedFiles.forEach((file) => {
      formData.append('relatedDocs', file, file.name);
    });

    this.managerService.addProject(formData).subscribe({
      next: (response) => {
        this.projects.push(response.project);
        this.closeModal();
        this.loaderService.hide();
        this.showSuccessAlert('Project created successfully!');
      },
      error: (error) => {
        console.error('Error creating project:', error);
        this.loaderService.hide();
        this.showErrorAlert('Error creating project. Please try again.');
      }
    });
  }

  updateProject() {
    this.loaderService.show();
    const formData = new FormData();
    
    // Append basic project details
    formData.append('title', this.newProject.title);
    formData.append('description', this.newProject.description);
    formData.append('deadline', this.newProject.deadline);
    formData.append('assignedTo', JSON.stringify(this.newProject.assignedTo));
    formData.append('status', this.newProject.status);
    
    // Append new files if any are selected
    if (this.selectedFiles) {
      for (const file of this.selectedFiles) {
        formData.append('relatedDocs', file);
      }
    }

    this.managerService.updateProject(this.editingProject!._id, formData).subscribe({
      next: (response) => {
        const index = this.projects.findIndex(p => p._id === this.editingProject!._id);
        if (index !== -1) {
          this.projects[index] = response.project;
        }
        this.closeModal();
        this.loaderService.hide();
        this.showSuccessAlert('Project updated successfully!');
      },
      error: (error) => {
        console.error('Error updating project:', error);
        this.loaderService.hide();
        this.showErrorAlert('Error updating project. Please try again.');
      }
    });
  }

  deleteProject(projectId: string) {
    const project = this.projects.find(p => p._id === projectId);
    if (!project || !this.isProjectCreatedByManager(project)) {
      this.showErrorAlert('You can only delete projects that you created.');
      return;
    }

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
        this.managerService.deleteProject(projectId).subscribe({
          next: () => {
            this.projects = this.projects.filter(p => p._id !== projectId);
            this.loaderService.hide();
            this.showSuccessAlert('Project deleted successfully!');
          },
          error: (error) => {
            console.error('Error deleting project:', error);
            this.loaderService.hide();
            this.showErrorAlert('Error deleting project. Please try again.');
          }
        });
      }
    });
  }

  resetNewProject() {
    this.newProject = {
      title: '',
      description: '',
      deadline: '',
      assignedTo: [],
      relatedDocs: [],
      status: 'Assigned'
    };
    this.selectedFiles = [];
  }

  getDeveloperName(devId: string): string {
    const developer = this.developers.find(dev => dev._id === devId);
    return developer ? developer.username : 'Unknown Developer';
  }

  viewProject(project: Project) {
    this.viewingProject = project;
    this.loadProjectTasks(project._id);
  }

  closeViewModal() {
    const modalElement = document.querySelector('.animate__fadeInDown');
    modalElement?.classList.remove('animate__fadeInDown');
    modalElement?.classList.add('animate__fadeOutUp');
    
    setTimeout(() => {
      this.viewingProject = null;
      this.projectStats = {
        totalTasks: 0,
        completedTasks: 0,
        progress: 0,
        daysRemaining: 0,
        isOverdue: false
      };
    }, 300);
  }

  getFileName(url: string): string {
    return url.split('/').pop() || url;
  }

  setHoveredProject(projectId: string | null) {
    this.hoveredProjectId = projectId;
  }

  isProjectHovered(projectId: string): boolean {
    return this.hoveredProjectId === projectId;
  }

  private showSuccessAlert(message: string) {
    Swal.fire({
      title: 'Success!',
      text: message,
      icon: 'success',
      confirmButtonText: 'OK'
    });
  }

  private showErrorAlert(message: string, callback?: () => void) {
    Swal.fire({
      title: 'Error!',
      text: message,
      icon: 'error',
      confirmButtonText: 'OK'
    }).then(() => {
      if (callback) {
        callback();
      }
    });
  }

  isProjectCreatedByManager(project: Project): boolean {
    return project.createdBy === this.managerProfile?._id;
  }

  editProjectFromView() {
    if (!this.viewingProject || !this.isProjectCreatedByManager(this.viewingProject)) {
      this.showErrorAlert('You can only edit projects that you created.');
      return;
    }

    const projectToEdit = this.viewingProject;
    this.closeViewModal();
    setTimeout(() => {
      this.openModal(projectToEdit);
    }, 300);
  }

  viewProjectTasks(project: Project) {
    this.viewingProject = project;
    this.selectedProject = project;
    this.loadProjectTasks(project._id);
    this.showTasksModal = true;
  }

  loadProjectTasks(projectId: string) {
    this.loaderService.show();
    this.managerService.getTasksByProject(projectId).subscribe({
      next: (tasks) => {
        this.projectTasks = tasks;
        this.calculateProjectStats();
        this.loaderService.hide();
      },
      error: (error) => {
        console.error('Error loading project tasks:', error);
        this.showErrorAlert('Unable to load project tasks');
        this.loaderService.hide();
      }
    });
  }

  closeTasksModal() {
    this.showTasksModal = false;
    this.selectedProject = null;
    this.projectTasks = [];
  }

  calculateProjectStats() {
    if (this.viewingProject) {
      // Calculate tasks stats
      this.projectStats.totalTasks = this.projectTasks.length;
      this.projectStats.completedTasks = this.projectTasks.filter(task => task.status === 'Completed').length;
      this.projectStats.progress = this.projectStats.totalTasks > 0 
        ? Math.round((this.projectStats.completedTasks / this.projectStats.totalTasks) * 100)
        : 0;

      // Calculate days remaining
      const today = new Date();
      const deadline = new Date(this.viewingProject.deadline);
      const diffTime = deadline.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      this.projectStats.daysRemaining = Math.abs(diffDays);
      this.projectStats.isOverdue = diffDays < 0;
    }
  }

  addTaskToProject(project: Project) {
    this.newTask = {
      taskName: '',
      description: '',
      startDate: '',
      endDate: '',
      projectId: {
        _id: project._id,
        title: project.title
      },
      participants: [],
      status: 'Assigned'
    };
    
    this.closeViewModal();
    setTimeout(() => {
      this.showTaskModal = true;
      this.loadProjectDevelopers(project.assignedTo);
    }, 300);
  }

  closeTaskModal() {
    const modalElement = document.querySelector('.animate__fadeInDown');
    if (modalElement) {
      modalElement.classList.remove('animate__fadeInDown');
      modalElement.classList.add('animate__fadeOutUp');
      
      setTimeout(() => {
        this.showTaskModal = false;
        this.resetNewTask();
      }, 300);
    } else {
      this.showTaskModal = false;
      this.resetNewTask();
    }
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
  }

  submitTask() {
    if (!this.newTask.projectId._id) {
      this.showErrorAlert('Project ID is required');
      return;
    }

    const formData = new FormData();
    
    // Append basic task data
    formData.append('taskName', this.newTask.taskName);
    formData.append('description', this.newTask.description);
    formData.append('startDate', this.newTask.startDate);
    formData.append('endDate', this.newTask.endDate);
    formData.append('projectId', this.newTask.projectId._id);
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

    this.loaderService.show();
    this.managerService.addTask(formData).subscribe({
      next: (response) => {
        this.showSuccessAlert('Task created successfully');
        this.closeTaskModal();
        this.loadProjectTasks(this.newTask.projectId._id);
        this.selectedFiles = [];
        this.loaderService.hide();
      },
      error: (error) => {
        console.error('Error creating task:', error);
        this.showErrorAlert(error.error.message || 'Failed to create task');
        this.loaderService.hide();
      }
    });
  }

  toggleParticipant(developer: Developer) {
    const index = this.newTask.participants.findIndex(p => 
      p.participantId?._id === developer._id
    );
    
    if (index === -1) {
      this.newTask.participants.push({
        participantId: {
          _id: developer._id,
          username: developer.username
        }
      });
    } else {
      this.newTask.participants.splice(index, 1);
    }
  }

  isParticipantSelected(developerId: string): boolean {
    return this.newTask.participants.some(p => 
      p.participantId?._id === developerId
    );
  }

  loadProjectDevelopers(developerIds: string[]) {
    this.loaderService.show();
    this.managerService.getAllDevelopers().subscribe({
      next: (response: Developer[]) => {
        this.assignedDevelopers = response.filter(dev => 
          developerIds.includes(dev._id)
        );
        this.loaderService.hide();
      },
      error: (error) => {
        console.error('Error loading project developers:', error);
        this.loaderService.hide();
        this.showErrorAlert('Error loading project developers. Please try again.');
      }
    });
  }
}