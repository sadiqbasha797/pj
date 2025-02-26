import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClientService } from '../../services/client.service';
import { HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ClientAuthService } from '../../services/client-auth.service';

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

interface MeetingForm {
  _id?: string;
  title: string;
  description: string;
  eventDate: string;
  time: string;
  location: string;
  isAllDay: boolean;
  participants: Participant[];
}

interface ParticipantOption {
  _id: string;
  email: string;
  username?: string;
  role: string;
}

@Component({
  selector: 'app-meetings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './meetings.component.html',
  styleUrl: './meetings.component.css'
})
export class MeetingsComponent implements OnInit {
  meetings: Meeting[] = [];
  loading = false;
  error: string | null = null;
  activeActionMenu: string | null = null;
  showMeetingForm = false;
  isEditing = false;
  
  meetingForm: MeetingForm = {
    title: '',
    description: '',
    eventDate: '',
    time: '',
    location: '',
    isAllDay: false,
    participants: []
  };

  availableParticipants: any[] = [];
  selectedParticipants: string[] = [];
  currentUserId: string | null = null;

  constructor(
    private clientService: ClientService,
    private clientAuthService: ClientAuthService
  ) {
    // Remove this from constructor since it might run before login data is available
  }

  ngOnInit() {
    this.currentUserId = localStorage.getItem('userId');
    console.log('CurrentUserId in ngOnInit:', this.currentUserId);
    this.loadMeetings();
    this.loadAllParticipants();
  }

  loadMeetings() {
    this.loading = true;
    this.error = null;
    
    this.clientService.getMeetings().subscribe({
      next: (response) => {
        this.meetings = response.meetings;
        console.log('Loaded meetings:', this.meetings);
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

  createMeeting(meetingData: any) {
    this.loading = true;
    this.error = null;
    
    this.clientService.createMeeting(meetingData).subscribe({
      next: (response) => {
        this.loadMeetings(); // Reload meetings after creation
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to create meeting';
        this.loading = false;
        console.error('Error creating meeting:', error);
      }
    });
  }

  updateMeeting(meetingId: string, meetingData: any) {
    this.loading = true;
    this.error = null;
    
    this.clientService.updateMeeting(meetingId, meetingData).subscribe({
      next: (response) => {
        this.loadMeetings(); // Reload meetings after update
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to update meeting';
        this.loading = false;
        console.error('Error updating meeting:', error);
      }
    });
  }

  deleteMeeting(meetingId: string) {
    this.loading = true;
    this.error = null;
    
    this.clientService.deleteMeeting(meetingId).subscribe({
      next: (response) => {
        this.loadMeetings(); // Reload meetings after deletion
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to delete meeting';
        this.loading = false;
        console.error('Error deleting meeting:', error);
      }
    });
  }

  @HostListener('document:click', ['$event'])
  closeActionMenu(event: Event) {
    // Only close if clicking outside of any action menu button or dropdown
    const target = event.target as HTMLElement;
    if (!target.closest('.action-menu')) {
      this.activeActionMenu = null;
    }
  }

  toggleActionMenu(meetingId: string, event: Event) {
    event.stopPropagation(); // Prevent the document click handler from firing
    this.activeActionMenu = this.activeActionMenu === meetingId ? null : meetingId;
  }

  openCreateMeetingDialog() {
    this.isEditing = false;
    this.resetForm();
    this.showMeetingForm = true;
  }

  openEditMeetingDialog(meeting: Meeting) {
    if (!this.canEditMeeting(meeting)) {
      this.error = 'You can only edit meetings that you created';
      return;
    }

    this.isEditing = true;
    const [date, time] = new Date(meeting.eventDate).toISOString().split('T');
    
    this.meetingForm = {
      _id: meeting._id,
      title: meeting.title,
      description: meeting.description,
      eventDate: date,
      time: time.substring(0, 5),
      location: meeting.location,
      isAllDay: meeting.isAllDay,
      participants: meeting.participants
    };

    // Set selected participants
    this.selectedParticipants = meeting.participants.map(p => p._id);
    
    this.showMeetingForm = true;
    this.activeActionMenu = null;
  }

  resetForm() {
    this.meetingForm = {
      title: '',
      description: '',
      eventDate: '',
      time: '',
      location: '',
      isAllDay: false,
      participants: []
    };
    this.selectedParticipants = [];
    this.error = null;
  }

  closeForm() {
    this.showMeetingForm = false;
    this.resetForm();
  }

  submitForm() {
    if (!this.meetingForm.title || !this.meetingForm.eventDate) {
      this.error = 'Please fill in all required fields';
      return;
    }

    const meetingData = {
      ...this.meetingForm,
      eventDate: this.meetingForm.isAllDay 
        ? this.meetingForm.eventDate 
        : `${this.meetingForm.eventDate}T${this.meetingForm.time}`,
      participants: this.selectedParticipants.map(id => {
        const participant = this.availableParticipants.find(p => p._id === id);
        return {
          participantId: participant._id,
          email: participant.email,
          role: participant.role,
          onModel: this.getParticipantModel(participant.role)
        };
      }),
      eventType: 'meeting'
    };

    if (this.isEditing && this.meetingForm._id) {
      this.updateMeeting(this.meetingForm._id, meetingData);
    } else {
      this.createMeeting(meetingData);
    }

    this.closeForm();
  }

  private getParticipantModel(role: string): string {
    switch (role) {
      case 'Admin':
        return 'Admin';
      case 'Manager':
        return 'Manager';
      case 'Developer':
        return 'Developer';
      case 'Digital Marketing':
        return 'DigitalMarketingRole';
      case 'Content Creator':
        return 'ContentCreator';
      default:
        return 'Client';
    }
  }

  confirmDeleteMeeting(meetingId: string) {
    const meeting = this.meetings.find(m => m._id === meetingId);
    if (!meeting || !this.canEditMeeting(meeting)) {
      this.error = 'You can only delete meetings that you created';
      return;
    }

    if (confirm('Are you sure you want to delete this meeting?')) {
      this.deleteMeeting(meetingId);
    }
    this.activeActionMenu = null;
  }

  async loadAllParticipants() {
    try {
      const [admins, managers, developers, marketers, creators] = await Promise.all([
        this.clientService.getAllAdmins().toPromise(),
        this.clientService.getAllManagers().toPromise(),
        this.clientService.getAllDevelopers().toPromise(),
        this.clientService.getAllMembers().toPromise(),
        this.clientService.getAllContentCreatorMembers().toPromise()
      ]);

      this.availableParticipants = [
        ...(admins?.admins || []).map((admin: { _id: any; email: any; username: any; }) => ({
          _id: admin._id,
          email: admin.email,
          username: admin.username,
          role: 'Admin'
        })),
        ...(managers || []).map((manager: { _id: any; email: any; username: any; }) => ({
          _id: manager._id,
          email: manager.email,
          username: manager.username,
          role: 'Manager'
        })),
        ...(developers || []).map((dev: { _id: any; email: any; username: any; }) => ({
          _id: dev._id,
          email: dev.email,
          username: dev.username,
          role: 'Developer'
        })),
        ...(marketers?.data || []).map((marketer: { _id: any; email: any; username: any; }) => ({
          _id: marketer._id,
          email: marketer.email,
          username: marketer.username,
          role: 'Digital Marketing'
        })),
        ...(creators?.data || []).map((creator: { _id: any; email: any; username: any; }) => ({
          _id: creator._id,
          email: creator.email,
          username: creator.username,
          role: 'Content Creator'
        }))
      ];
    } catch (error) {
      console.error('Error loading participants:', error);
      this.error = 'Failed to load participants';
    }
  }

  toggleParticipant(participantId: string) {
    const index = this.selectedParticipants.indexOf(participantId);
    if (index === -1) {
      this.selectedParticipants.push(participantId);
    } else {
      this.selectedParticipants.splice(index, 1);
    }
  }

  isParticipantSelected(participantId: string): boolean {
    return this.selectedParticipants.includes(participantId);
  }

  canEditMeeting(meeting: Meeting): boolean {
    const currentUserId = localStorage.getItem('userId');
    console.log('Checking edit permission:', {
      meetingCreatorId: meeting.creator._id,
      currentUserId: currentUserId,
      isMatch: meeting.creator._id === currentUserId
    });
    return meeting.creator._id === currentUserId;
  }
}
