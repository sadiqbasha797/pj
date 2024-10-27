import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminService } from '../../services/admin.service';
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

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.css'
})
export class ProjectsComponent implements OnInit {
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
    this.showModal = false;
    this.editingProject = null;
    this.resetNewProject();
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
    console.log('Updating project with data:', this.newProject);
    const updatedProject = {
      title: this.newProject.title,
      description: this.newProject.description,
      deadline: this.newProject.deadline,
      assignedTo: this.newProject.assignedTo,
      status: this.newProject.status
    };
    this.adminService.updateProject(this.editingProject!._id, updatedProject).subscribe({
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
  }

  closeViewModal() {
    this.viewingProject = null;
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
}
