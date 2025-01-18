import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminService } from '../../services/admin.service';
import { LoaderService } from '../../services/loader.service';
import Swal from 'sweetalert2';
import { TaskComponent } from '../task/task.component';

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

interface Task {
  taskName: string;
  startDate: string;
  endDate: string;
  projectId: string | Project; // Allow both string and Project object
  participants: Participant[];
  status: string;
}

interface Participant {
  _id: string;
  participantId: {
    _id: string;
    username: string;
  };
}

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.css'
})
export class ProjectsComponent implements OnInit {
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

addOrUpdateTask() {
  this.loaderService.show();
  // Format the task data to match the API expectations
  const taskData = {
    ...this.newTask,
    projectId: typeof this.newTask.projectId === 'object' ? this.newTask.projectId._id : this.newTask.projectId,
    participants: this.newTask.participants.map(p => ({ participantId: p.participantId._id }))
  };

  this.adminService.addTask(taskData).subscribe({
    next: (response) => {
      this.loaderService.hide();
      this.showSuccessAlert('Task added successfully!');
      this.closeTaskModal();
    },
    error: (error) => {
      console.error('Error adding task:', error);
      this.loaderService.hide();
      this.showErrorAlert('Error adding task. Please try again.');
    }
  });
}

resetTaskForm() {
  this.newTask = {
    taskName: '',
    startDate: '',
    endDate: '',
    projectId: {
      _id: '', title: '',
      description: '',
      deadline: '',
      assignedTo: [],
      relatedDocs: [],
      status: '',
      createdBy: '',
      lastUpdatedBy: '',
      updatedAt: '',
      createdAt: ''
    },
    participants: [],
    status: 'Assigned'
  };
}

closeTaskModal() {
  this.showTaskModal = false;
  this.resetTaskForm();
}

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
tasks: Task[] = [];
projectStats = {
  totalTasks: 0,
  completedTasks: 0,
  progress: 0,
  daysRemaining: 0,
  isOverdue: false
};
showTaskModal = false;
newTask: Task = {
  taskName: '',
  startDate: '',
  endDate: '',
  projectId: '',
  participants: [],
  status: 'Assigned'
};
assignedDevelopers: Developer[] = [];

constructor(
  private adminService: AdminService,
  private loaderService: LoaderService,
  private router: Router
) {}

ngOnInit() {
  this.loadProjects();
  this.loadDevelopers();
}

loadProjects() {
  this.loaderService.show();
  this.adminService.getProjects().subscribe({
    next: (response) => {
      this.projects = response;
      this.loaderService.hide();
    },
    error: (error) => {
      console.error('Error loading projects:', error);
      this.loaderService.hide();
      this.showErrorAlert('Error loading projects. Please try again.');
    }
  });
}

loadDevelopers() {
  this.loaderService.show();
  this.adminService.getAllDevelopers().subscribe({
    next: (response: Developer[]) => {
      this.developers = response;
      this.loaderService.hide();
    },
    error: (error) => {
      console.error('Error loading developers:', error);
      this.loaderService.hide();
      if (error.status === 403) {
        this.showErrorAlert('Your session has expired. Please log in again.', () => {
          localStorage.removeItem('adminToken');
          this.router.navigate(['/admin/login']);
        });
      } else {
        this.showErrorAlert('Error loading developers. Please try again.');
      }
    }
  });
}

openModal(project: Project | null = null) {
  this.editingProject = project;
  if (project) {
    this.newProject = { ...project };
  } else {
    this.resetNewProject();
  }
  this.showModal = true;
}

closeModal() {
  const modalElement = document.querySelector('.animate__fadeInDown');
  modalElement?.classList.remove('animate__fadeInDown');
  modalElement?.classList.add('animate__fadeOutUp');
  
  setTimeout(() => {
    this.showModal = false;
    this.editingProject = null;
    this.resetNewProject();
  }, 300);
}

addDeveloper(developerId: string) {
  if (developerId && !this.newProject.assignedTo.includes(developerId)) {
    this.newProject.assignedTo.push(developerId);
  }
}

removeDeveloper(index: number) {
  this.newProject.assignedTo.splice(index, 1);
}

onFileSelected(event: any) {
  const files: FileList = event.target.files;
  if (files) {
    this.selectedFiles = Array.from(files);
  }
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
  console.log('Sending FormData:');
  formData.forEach((value, key) => {
    console.log(key, value);
  });
  this.adminService.addProject(formData).subscribe({
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
  this.selectedFiles.forEach((file) => {
    formData.append('relatedDocs', file, file.name);
  });

  this.adminService.updateProject(this.editingProject!._id, formData).subscribe({
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
      this.adminService.deleteProject(projectId).subscribe({
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

viewProject(project: Project) {
  this.viewingProject = project;
  this.loadProjectStats(project._id);
}

loadProjectStats(projectId: string) {
  this.adminService.getTasksByProject(projectId).subscribe({
    next: (response) => {
      this.tasks = response;
      this.calculateProjectStats();
    },
    error: (error) => {
      console.error('Error loading project tasks:', error);
      this.showErrorAlert('Error loading project tasks');
    }
  });
}

calculateProjectStats() {
  if (this.viewingProject && this.tasks) {
    // Calculate tasks stats
    this.projectStats.totalTasks = this.tasks.length;
    this.projectStats.completedTasks = this.tasks.filter(task => task.status === 'Completed').length;
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

closeViewModal() {
  const modalElement = document.querySelector('.animate__fadeInDown');
  modalElement?.classList.remove('animate__fadeInDown');
  modalElement?.classList.add('animate__fadeOutUp');
  
  setTimeout(() => {
    this.viewingProject = null;
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

editProjectFromView() {
  // Store the current project data
  const projectToEdit = this.viewingProject;
  // Close the view modal
  this.closeViewModal();
  // Open the edit modal with the project data
  setTimeout(() => {
    this.openModal(projectToEdit);
  }, 300); // Wait for view modal animation to complete
}

addTaskFromProject() {
  if (!this.viewingProject) return;
  
  this.closeViewModal();
  this.loadAssignedDevelopers(this.viewingProject._id);
  // Set only the project ID and title
  this.newTask = {
    taskName: '',
    startDate: '',
    endDate: '',
    projectId: this.viewingProject._id,
    participants: [],
    status: 'Assigned'
  };
  
  setTimeout(() => {
    this.showTaskModal = true;
  }, 300);
}

loadAssignedDevelopers(projectId: string) {
  this.adminService.getAssignedDevelopers(projectId).subscribe({
    next: (developers) => {
      this.assignedDevelopers = developers;
    },
    error: (error) => {
      console.error('Error loading assigned developers:', error);
      this.showErrorAlert('Unable to load assigned developers');
    }
  });
}
}
