import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../services/admin.service';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { CacheService } from '../../services/cache.service';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatDialogModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatChipsModule,
    MatMenuModule
  ],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css'
})
export class UsersComponent implements OnInit {
  developers: any[] = [];
  managers: any[] = [];
  developerColumns: string[] = ['username', 'email', 'skills', 'actions'];
  managerColumns: string[] = ['username', 'email', 'teamSize', 'actions'];
  developerForm: FormGroup;
  managerForm: FormGroup;
  showDeveloperForm = false;
  showManagerForm = false;
  hidePassword = true;
  activeTab: 'developers' | 'managers' = 'developers';
  selectedDeveloper: any = null;
  developerProjects: any[] = [];
  developerTasks: any[] = [];
  developerMeetings: any[] = [];
  upcomingMeetings: any[] = [];
  pastMeetings: any[] = [];
  activeEventTab: 'upcoming' | 'past' = 'upcoming';

  constructor(
    private adminService: AdminService,
    private snackBar: MatSnackBar,
    private fb: FormBuilder,
    private cacheService: CacheService
  ) {
    this.developerForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      skills: ['']
    });

    this.managerForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      teamSize: [0, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit() {
    this.loadDevelopers();
    this.loadManagers();
  }

  loadDevelopers() {
    this.adminService.getAllDevelopers().subscribe({
      next: (data) => {
        this.developers = data;
      },
      error: (error) => {
        this.showMessage('Error loading developers');
        console.error(error);
      }
    });
  }

  loadManagers() {
    this.adminService.getAllManagers().subscribe({
      next: (data) => {
        this.managers = data;
      },
      error: (error) => {
        this.showMessage('Error loading managers');
        console.error(error);
      }
    });
  }

  deleteDeveloper(id: string) {
    if (confirm('Are you sure you want to delete this developer?')) {
      this.adminService.deleteDeveloper(id).subscribe({
        next: () => {
          this.showMessage('Developer deleted successfully');
          this.loadDevelopers();
        },
        error: (error) => {
          this.showMessage('Error deleting developer');
          console.error(error);
        }
      });
    }
  }

  deleteManager(id: string) {
    if (confirm('Are you sure you want to delete this manager?')) {
      this.adminService.deleteManager(id).subscribe({
        next: () => {
          this.showMessage('Manager deleted successfully');
          this.loadManagers();
        },
        error: (error) => {
          this.showMessage('Error deleting manager');
          console.error(error);
        }
      });
    }
  }

  registerDeveloper() {
    if (this.developerForm.valid) {
      const developerData = {
        ...this.developerForm.value,
        skills: this.developerForm.value.skills.split(',').map((skill: string) => skill.trim())
      };

      this.adminService.registerDeveloper(developerData).subscribe({
        next: () => {
          this.showMessage('Developer registered successfully');
          this.loadDevelopers();
          this.developerForm.reset();
          this.showDeveloperForm = false;
        },
        error: (error) => {
          this.showMessage('Error registering developer');
          console.error(error);
        }
      });
    }
  }

  registerManager() {
    if (this.managerForm.valid) {
      this.adminService.registerManager(this.managerForm.value).subscribe({
        next: () => {
          this.showMessage('Manager registered successfully');
          this.loadManagers();
          this.managerForm.reset();
          this.showManagerForm = false;
        },
        error: (error) => {
          this.showMessage('Error registering manager');
          console.error(error);
        }
      });
    }
  }

  private showMessage(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'right',
      verticalPosition: 'top'
    });
  }

  editDeveloper(developer: any) {
    // Implement edit functionality
    console.log('Edit developer:', developer);
  }

  viewDeveloperDetails(developer: any) {
    this.selectedDeveloper = developer;
    this.loadDeveloperDetails(developer._id);
  }

  loadDeveloperDetails(developerId: string) {
    // Check cache first
    const cachedData = this.cacheService.getCachedDeveloperData(developerId);
    
    if (cachedData) {
      // Use cached data
      this.developerProjects = cachedData.projects;
      this.developerTasks = cachedData.tasks;
      this.upcomingMeetings = cachedData.upcomingMeetings;
      this.pastMeetings = cachedData.pastMeetings;
    }

    // Load projects
    this.adminService.getAllProjects().subscribe({
      next: (projects) => {
        this.developerProjects = projects.filter((project: any) => 
          project.assignedTo?.includes(developerId)
        );
        this.cacheService.updateCacheAfterApiCall(developerId, 'projects', this.developerProjects);
      },
      error: (error) => {
        console.error('Error loading developer projects:', error);
        this.showMessage('Error loading developer projects');
      }
    });

    // Load tasks
    this.adminService.getAllTasks().subscribe({
      next: (tasks) => {
        this.developerTasks = tasks.filter((task: any) => 
          task.participants?.some((participant: any) => 
            participant.participantId._id === developerId
          )
        ).map((task: any) => ({
          taskName: task.taskName,
          projectName: task.projectId.title,
          startDate: task.startDate,
          endDate: task.endDate,
          status: task.status
        }));
        this.cacheService.updateCacheAfterApiCall(developerId, 'tasks', this.developerTasks);
      },
      error: (error) => {
        console.error('Error loading developer tasks:', error);
        this.showMessage('Error loading developer tasks');
      }
    });

    // Load events
    this.adminService.getAllEvents().subscribe({
      next: (events) => {
        const developerEvents = events.filter((event: any) => 
          event.participants?.some((participant: any) => 
            participant.participantId === developerId && 
            participant.onModel === 'Developer'
          )
        );

        const now = new Date();
        
        this.upcomingMeetings = developerEvents.filter((event: { endDate: string | number | Date; eventDate: string | number | Date; }) => {
          const endDate = event.endDate ? new Date(event.endDate) : new Date(event.eventDate);
          return endDate >= now;
        }).sort((a: { eventDate: string | number | Date; }, b: { eventDate: string | number | Date; }) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime());

        this.pastMeetings = developerEvents.filter((event: { endDate: string | number | Date; eventDate: string | number | Date; }) => {
          const endDate = event.endDate ? new Date(event.endDate) : new Date(event.eventDate);
          return endDate < now;
        }).sort((a: { eventDate: string | number | Date; }, b: { eventDate: string | number | Date; }) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime());

        this.cacheService.updateCacheAfterApiCall(developerId, 'upcomingMeetings', this.upcomingMeetings);
        this.cacheService.updateCacheAfterApiCall(developerId, 'pastMeetings', this.pastMeetings);
      },
      error: (error) => {
        console.error('Error loading developer meetings:', error);
        this.showMessage('Error loading developer meetings');
      }
    });
  }

  getStatusClass(status: string): string {
    const statusClasses: { [key: string]: string } = {
      'In Progress': 'bg-blue-100 text-blue-800',
      'Completed': 'bg-green-100 text-green-800',
      'Pending': 'bg-yellow-100 text-yellow-800',
      'On Hold': 'bg-gray-100 text-gray-800'
    };
    return statusClasses[status] || 'bg-gray-100 text-gray-800';
  }

  getTaskStatusClass(status: string): string {
    const statusClasses: { [key: string]: string } = {
      'In Progress': 'bg-blue-100 text-blue-800',
      'Completed': 'bg-green-100 text-green-800',
      'Todo': 'bg-yellow-100 text-yellow-800',
      'Blocked': 'bg-red-100 text-red-800'
    };
    return statusClasses[status] || 'bg-gray-100 text-gray-800';
  }
}