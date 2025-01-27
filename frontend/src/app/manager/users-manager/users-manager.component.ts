import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ManagerService } from '../../services/manager.service';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';

interface Task {
  _id: string;
  taskName: string;
  description?: string;
  status: string;
  startDate: string;
  endDate: string;
  projectId: {
    _id: string;
    title: string;
  };
  participants: {
    participantId: {
      _id: string;
      username: string;
    };
    _id: string;
  }[];
  finalResult?: {
    description?: string;
    resultImages?: string[];
    updatedBy?: string;
  };
  updates: {
    content: string;
    updatedBy: string;
    updatedByName: string;
    updatedByModel: string;
    relatedMedia: string[];
    _id: string;
    updateId: string;
    timestamp: string;
  }[];
}

@Component({
  selector: 'app-users-manager',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatSnackBarModule
  ],
  templateUrl: './users-manager.component.html',
  styleUrl: './users-manager.component.css'
})
export class UsersManagerComponent implements OnInit {
  managerProfile: any;
  loading = true;
  error: string | null = null;
  selectedDeveloper: any = null;
  developerProjects: any[] = [];
  developerTasks: any[] = [];
  upcomingMeetings: any[] = [];
  pastMeetings: any[] = [];
  activeEventTab: 'upcoming' | 'past' = 'upcoming';
  digitalMarketingMembers: any[] = [];
  contentCreatorMembers: any[] = [];

  constructor(
    private managerService: ManagerService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadManagerProfile();
  }

  private loadManagerProfile() {
    this.managerService.getManagerProfile().subscribe({
      next: (profile) => {
        this.managerProfile = profile;
        this.loadTeamMembers();
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load manager profile';
        this.loading = false;
        console.error('Error loading profile:', err);
      }
    });
  }

  private loadTeamMembers() {
    // Get assigned digital marketing member IDs
    const assignedDigitalMarketingIds = this.managerProfile.digitalMarketingRoles?.map(
      (role: any) => role.roleId
    ) || [];

    // Get assigned content creator IDs
    const assignedContentCreatorIds = this.managerProfile.contentCreators?.map(
      (creator: any) => creator.roleId
    ) || [];

    // Load and filter digital marketing members
    this.managerService.getAllDigitalMarketingMembers().subscribe({
      next: (response) => {
        if (response.success) {
          this.digitalMarketingMembers = response.data.filter(member => 
            assignedDigitalMarketingIds.includes(member._id)
          );
        }
      },
      error: (error) => {
        console.error('Error loading digital marketing team:', error);
        this.showMessage('Error loading digital marketing team members');
      }
    });

    // Load and filter content creator members
    this.managerService.getAllContentCreatorMembers().subscribe({
      next: (response) => {
        if (response.success) {
          this.contentCreatorMembers = response.data.filter(member => 
            assignedContentCreatorIds.includes(member._id)
          );
        }
      },
      error: (error) => {
        console.error('Error loading content creator team:', error);
        this.showMessage('Error loading content creator team members');
      }
    });
  }

  viewDeveloperDetails(developerId: string) {
    // Find the developer from the manager's developers array
    const developer = this.managerProfile.developers.find(
      (dev: any) => dev.developerId === developerId
    );
    if (developer) {
      this.selectedDeveloper = developer;
      this.loadDeveloperDetails(developerId);
    }
  }

  loadDeveloperDetails(developerId: string) {
    // Load projects
    this.managerService.getProjects().subscribe({
      next: (projects) => {
        this.developerProjects = projects.filter((project: any) => 
          project.assignedTo?.includes(developerId)
        );
        console.log('Filtered projects:', this.developerProjects);
      },
      error: (error) => {
        this.showMessage('Error loading developer projects');
        console.error(error);
      }
    });

    // Load tasks
    this.managerService.getAllTasks().subscribe({
      next: (tasks) => {
        this.developerTasks = tasks.filter((task: Task) => 
          task.participants.some(participant => 
            participant.participantId._id === developerId
          )
        ).map((task: Task) => ({
          _id: task._id,
          taskName: task.taskName,
          description: task.description,
          status: task.status,
          startDate: task.startDate,
          endDate: task.endDate,
          project: {
            projectName: task.projectId.title
          },
          updates: task.updates,
          finalResult: task.finalResult
        }));
        console.log('Filtered tasks:', this.developerTasks);
      },
      error: (error) => {
        this.showMessage('Error loading developer tasks');
        console.error(error);
      }
    });

    // Load events
    this.managerService.getAllEvents().subscribe({
      next: (events) => {
        const now = new Date();
        const developerEvents = events.filter((event: any) => 
          event.participants?.some((participant: any) => 
            participant.participantId === developerId
          )
        );

        this.upcomingMeetings = developerEvents
          .filter((event: any) => new Date(event.eventDate) >= now)
          .sort((a: any, b: any) => 
            new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime()
          );

        this.pastMeetings = developerEvents
          .filter((event: any) => new Date(event.eventDate) < now)
          .sort((a: any, b: any) => 
            new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime()
          );

        console.log('Upcoming meetings:', this.upcomingMeetings);
        console.log('Past meetings:', this.pastMeetings);
      },
      error: (error) => {
        this.showMessage('Error loading developer events');
        console.error(error);
      }
    });
  }

  getTaskStatusClass(status: string): string {
    const statusClasses: { [key: string]: string } = {
      'In Progress': 'bg-blue-100 text-blue-800',
      'Completed': 'bg-green-100 text-green-800',
      'Assigned': 'bg-yellow-100 text-yellow-800',
      'Blocked': 'bg-red-100 text-red-800'
    };
    return statusClasses[status] || 'bg-gray-100 text-gray-800';
  }

  private showMessage(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'right',
      verticalPosition: 'top'
    });
  }
}
