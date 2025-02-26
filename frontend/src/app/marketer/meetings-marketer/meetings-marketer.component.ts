import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MarketerService } from '../../services/marketer.services';
import { LoaderService } from '../../services/loader.service';

interface Participant {
  participantId: {
    username: string;
    email: string;
  };
  onModel: string;
  _id: string;
}

interface Meeting {
  _id: string;
  title: string;
  description: string;
  eventDate: string;
  createdBy: {
    username: string;
    email: string;
  };
  status: string;
  participants: Participant[];
  location: string;
  eventType: string;
  isAllDay: boolean;
  createdAt: string;
  updatedAt: string;
}

@Component({
  selector: 'app-meetings-marketer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './meetings-marketer.component.html',
  styleUrl: './meetings-marketer.component.css'
})
export class MeetingsMarketerComponent implements OnInit {
  meetings: Meeting[] = [];
  errorMessage: string = '';

  constructor(
    private marketerService: MarketerService,
    private loaderService: LoaderService
  ) {}

  ngOnInit(): void {
    this.loadMeetings();
  }

  loadMeetings(): void {
    this.loaderService.show();
    this.marketerService.getParticipatingMeetings().subscribe({
      next: (response) => {
        this.meetings = response.data;
        this.loaderService.hide();
      },
      error: (error) => {
        console.error('Error fetching meetings:', error);
        this.meetings = [];
        this.loaderService.hide();
      }
    });
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleString();
  }
}
