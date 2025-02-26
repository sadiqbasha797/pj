import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CreatorService } from '../../services/creator.service';
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
  selector: 'app-meetings-creator',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './meetings-creator.component.html',
  styleUrl: './meetings-creator.component.css'
})
export class MeetingsCreatorComponent implements OnInit {
  meetings: Meeting[] = [];
  errorMessage: string = '';

  constructor(
    private creatorService: CreatorService,
    private loaderService: LoaderService
  ) {}

  ngOnInit(): void {
    this.loadMeetings();
  }

  loadMeetings(): void {
    this.loaderService.show();
    this.creatorService.getParticipatingMeetings().subscribe({
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
