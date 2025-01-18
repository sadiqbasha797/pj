import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClientService } from '../../services/client.service';

interface Participant {
  _id: string;
  name?: string;
  email: string;
  role: string;
}

interface Creator {
  _id: string;
  email: string;
  role: string;
}

interface Meeting {
  _id: string;
  title: string;
  description: string;
  eventDate: string;
  location: string;
  isAllDay: boolean;
  project: any;
  creator: Creator;
  participants: Participant[];
}

@Component({
  selector: 'app-meetings',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './meetings.component.html',
  styleUrl: './meetings.component.css'
})
export class MeetingsComponent implements OnInit {
  meetings: Meeting[] = [];
  loading = false;
  error: string | null = null;

  constructor(private clientService: ClientService) {}

  ngOnInit() {
    this.loadMeetings();
  }

  loadMeetings() {
    this.loading = true;
    this.error = null;
    
    this.clientService.getMeetings().subscribe({
      next: (response) => {
        this.meetings = response.meetings;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load meetings';
        this.loading = false;
        console.error('Error loading meetings:', error);
      }
    });
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleString();
  }
}
