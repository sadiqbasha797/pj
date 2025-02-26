import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalendarModule } from 'primeng/calendar';
import { FullCalendarModule } from '@fullcalendar/angular';
import { DeveloperService } from '../../services/developer.service';
import { Calendar } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { DropdownModule } from 'primeng/dropdown';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { LoaderService } from '../../services/loader.service';

interface AdminResponse {
  admins: Array<{
    _id: string;
    username: string;
    // ... other admin properties
  }>;
}

interface DigitalMarketingResponse {
  success: boolean;
  data: Array<{
    _id: string;
    username: string;
    email: string;
    skills: string[];
    role: string;
    image: string | null;
    createdAt: string;
  }>;
}

interface ContentCreatorResponse {
  success: boolean;
  data: Array<{
    _id: string;
    username: string;
    email: string;
    skills: string[];
    role: string;
    image: string;
    createdAt: string;
  }>;
}

@Component({
  selector: 'app-calendar-developer',
  standalone: true,
  imports: [CommonModule, CalendarModule, FullCalendarModule, DialogModule, ButtonModule, FormsModule, InputTextModule, InputTextareaModule, DropdownModule, ReactiveFormsModule],
  templateUrl: './calendar-developer.component.html',
  styleUrl: './calendar-developer.component.css'
})
export class CalendarDeveloperComponent implements OnInit {
  completedCount: any;
  cancelledCount: any;
closeEventDialog: any;
  openFilterModal() {
    throw new Error('Method not implemented.');
  }
  calendarOptions: any;
  events: any[] = [];
  showEventDialog: boolean = false;
  selectedDateEvents: any[] = [];
  selectedDate: string = '';
  showAddEventDialog: boolean = false;
  newEvent: any = {
    title: '',
    description: '',
    eventType: '',
    location: '',
    participants: [],
    eventDate: new Date().toISOString().slice(0, 16),
    status: 'Active'
  };
  eventTypes: any[] = [
    { label: 'Work', value: 'Work' },
    { label: 'Reminder', value: 'Reminder' },
    { label: 'Other ', value: 'Other' },
  ];
  eventForm: FormGroup;
  editingEventId: string | undefined;
  viewingEvent: any = null;
  eventProject: any = null;
  developers: any[] = [];
  managers: any[] = [];
  marketingMembers: DigitalMarketingResponse['data'] = [];
  contentCreators: ContentCreatorResponse['data'] = [];
  admins: AdminResponse | null = null;
  clients: any[] = [];
  
  totalEvents: number = 0;
  meetingsCount: number = 0;
  tasksCount: number = 0;
  monthlyEvents: number = 0;

  filterForm: FormGroup;
  filteredEvents: any[] = [];

  constructor(
    private developerService: DeveloperService,
    private loaderService: LoaderService,
    private fb: FormBuilder
  ) {
    this.eventForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      eventType: ['', Validators.required],
      location: [''],
      eventDate: ['', Validators.required],
      priority: [''],
      reminderTime: ['']
    });

    this.filterForm = this.fb.group({
      eventType: [''],
      startDate: [''],
      endDate: ['']
    });
  }

  ngOnInit() {
    this.loadEvents();
    this.initializeCalendar();
    this.fetchAllParticipants();
    this.updateEventCounts();
  }

  loadEvents() {
    this.developerService.fetchDeveloperEvents().subscribe({
      next: (events) => {
        this.events = events.map((event: any) => ({
          id: event._id,
          title: event.title,
          start: new Date(event.eventDate),
          end: event.endDate ? new Date(event.endDate) : undefined,
          description: event.description,
          allDay: event.isAllDay,
          byMe: event.byMe,
          participants: event.participants,
          backgroundColor: this.getEventColor(event.eventType),
          extendedProps: {
            eventType: event.eventType,
            location: event.location,
            status: event.status,
          }
        }));
        console.log(this.events);
        this.updateCalendarEvents();
        this.updateEventCounts();
      },
      error: (error) => {
        console.error('Error loading events:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to load events. Please try again.',
          confirmButtonColor: '#3B82F6'
        });
      }
    });
  }

  private getEventColor(eventType: string): string {
    switch (eventType.toLowerCase()) {
      case 'meeting': return '#FF9800';
      case 'task': return '#4CAF50';
      case 'holiday': return '#E91E63';
      case 'project deadline': return '#F44336';
      default: return '#2196F3';
    }
  }

  private initializeCalendar() {
    this.calendarOptions = {
      plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
      initialView: 'dayGridMonth',
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay'
      },
      events: this.getEventCounts.bind(this),
      dateClick: this.handleDateClick.bind(this),
      displayEventTime: false,
      dayMaxEvents: true,
      height: 'auto',
      dayCellDidMount: this.highlightDatesWithEvents.bind(this),
      eventContent: (arg: { event: { extendedProps: { [x: string]: string; }; borderColor: any; backgroundColor: any; textColor: any; title: any; }; }) => {
        const icon = arg.event.extendedProps?.['icon'] || '📅';
        return {
          html: `
            <div class="flex items-center gap-1 px-2 py-1 rounded-md w-full overflow-hidden" style="
              border: 1px solid ${arg.event.borderColor};
              background-color: ${arg.event.backgroundColor};
              color: ${arg.event.textColor};
            ">
              <span class="event-icon">${icon}</span>
              <span class="event-title text-xs font-medium truncate">${arg.event.title}</span>
            </div>
          `
        };
      },
      eventDidMount: (info: { event: { title: string | string[]; }; el: { style: { fontSize: string; fontStyle: string; textAlign: string; backgroundColor: string; color: string; padding: string; borderRadius: string; margin: string; }; }; }) => {
        if (info.event.title.includes('+')) {
          info.el.style.fontSize = '0.75rem';
          info.el.style.fontStyle = 'italic';
          info.el.style.textAlign = 'center';
          info.el.style.backgroundColor = '#F3F4F6';
          info.el.style.color = '#6B7280';
          info.el.style.padding = '2px 4px';
          info.el.style.borderRadius = '4px';
          info.el.style.margin = '2px 0';
        }
      },
    };
  }

  private getEventCounts(fetchInfo: any, successCallback: any, failureCallback: any) {
    const events = this.events.reduce((acc: any[], event) => {
      const date = new Date(event.start).toDateString();
      const existingEvent = acc.find(e => new Date(e.start).toDateString() === date);
      if (existingEvent) {
        existingEvent.title = String(parseInt(existingEvent.title) + 1);
      } else {
        acc.push({
          start: event.start,
          title: '1',
          allDay: true,
          display: 'background',
          backgroundColor: 'rgba(33, 150, 243, 0.1)', // Light blue with reduced opacity
        });
      }
      return acc;
    }, []);
    successCallback(events);
  }

  highlightDatesWithEvents(arg: any) {
    const date = arg.date;
    const events = this.getEventsForDate(date);
    if (events.length > 0) {
      arg.el.style.backgroundColor = 'rgba(33, 150, 243, 0.1)'; // Light blue with reduced opacity
    }
  }

  getEventsForDate(date: Date): any[] {
    return this.events.filter(event => 
      new Date(event.start).toDateString() === date.toDateString()
    );
  }

  private updateCalendarEvents() {
    if (this.calendarOptions) {
      this.calendarOptions.events = this.getEventCounts.bind(this);
    }
  }

  handleEventClick(info: any) {
    console.log('Event clicked:', info.event);
  }

  handleDateClick(info: any) {
    const clickedDate = new Date(info.date);
    clickedDate.setHours(0, 0, 0, 0);

    this.selectedDateEvents = this.events.filter(event => {
      const eventDate = new Date(event.start);
      eventDate.setHours(0, 0, 0, 0);
      return eventDate.getTime() === clickedDate.getTime();
    });

    this.selectedDate = info.dateStr;
    this.showEventDialog = true;
  }

  closeDialog() {
    if (this.eventForm.dirty) {
      Swal.fire({
        title: 'Are you sure?',
        text: 'You have unsaved changes. Do you want to discard them?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3B82F6',
        cancelButtonColor: '#EF4444',
        confirmButtonText: 'Yes, discard',
        cancelButtonText: 'No, keep editing'
      }).then((result) => {
        if (result.isConfirmed) {
          this.showEventDialog = false;
          this.eventForm.reset();
        }
      });
    } else {
      this.showEventDialog = false;
    }
  }

  addNewEvent() {
    const formValue = this.eventForm.value;

    if (!formValue.title || !formValue.eventDate || !formValue.eventType) {
      Swal.fire({
        icon: 'error',
        title: 'Required Fields Missing',
        text: 'Please fill in all required fields',
        confirmButtonColor: '#3B82F6'
      });
      return;
    }

    const eventData = {
      title: formValue.title,
      description: formValue.description,
      eventType: formValue.eventType,
      location: formValue.location,
      eventDate: new Date(formValue.eventDate),
      priority: formValue.priority,
      reminderTime: formValue.reminderTime,
      status: 'Active'
    };

    this.developerService.addEvent(eventData).subscribe({
      next: (response) => {
        Swal.fire({
          icon: 'success',
          title: 'Event Added Successfully',
          showConfirmButton: false,
          timer: 1500
        });
        
        this.loadEvents();
        this.showAddEventDialog = false;
        this.eventForm.reset();
      },
      error: (error) => {
        console.error('Error adding event:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to add event. Please try again.',
          confirmButtonColor: '#3B82F6'
        });
      }
    });
  }

  handleEventSubmit() {
    if (this.eventForm.valid) {
      const formValue = this.eventForm.value;
      
      this.newEvent = {
        title: formValue.title,
        description: formValue.description,
        eventType: formValue.eventType,
        location: formValue.location,
        eventDate: formValue.eventDate,
        priority: formValue.priority,
        reminderTime: formValue.reminderTime
      };

      this.addNewEvent();
    } else {
      Object.keys(this.eventForm.controls).forEach(key => {
        const control = this.eventForm.get(key);
        control?.markAsTouched();
      });

      Swal.fire({
        icon: 'error',
        title: 'Invalid Form',
        text: 'Please fill in all required fields correctly',
        confirmButtonColor: '#3B82F6'
      });
    }
  }

  openAddEventDialog() {
    // Close any open modals first
    if (this.showEventDialog) {
      this.closeAddEventDialog();
    }
    if (this.viewingEvent) {
      this.closeViewModal();
    }

    const selectedDateTime = this.selectedDate 
      ? new Date(this.selectedDate).toISOString().slice(0, 16)
      : new Date().toISOString().slice(0, 16);
    
    setTimeout(() => {
      this.eventForm.reset();
      this.eventForm.patchValue({
        eventDate: selectedDateTime
      });
      this.showAddEventDialog = true;
    }, 300);
  }

  closeAddEventDialog() {
    if (this.eventForm.dirty) {
      Swal.fire({
        title: 'Are you sure?',
        text: 'You have unsaved changes. Do you want to discard them?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3B82F6',
        cancelButtonColor: '#EF4444',
        confirmButtonText: 'Yes, discard',
        cancelButtonText: 'No, keep editing'
      }).then((result) => {
        if (result.isConfirmed) {
          this.showAddEventDialog = false;
          this.eventForm.reset();
        }
      });
    } else {
      this.showAddEventDialog = false;
    }
  }

  viewEventDetails(event: any) {
    // Close events list modal first
    const listModalElement = document.querySelector('.animate__fadeInDown');
    listModalElement?.classList.remove('animate__fadeInDown');
    listModalElement?.classList.add('animate__fadeOutUp');
    
    setTimeout(() => {
      this.showEventDialog = false;
      this.selectedDate = '';
      this.selectedDateEvents = [];

      // Map participants with their details
      if (event.participants?.length > 0) {
        event.extendedProps = {
          ...event.extendedProps,
          participants: event.participants.map((participant: any) => {
            let person;
            if (participant.onModel === 'Developer') {
              person = this.developers.find(d => d._id === participant.participantId);
              return {
                participantId: participant.participantId,
                type: 'Developer',
                name: person ? person.username : 'Unknown Developer'
              };
            } else if (participant.onModel === 'Manager') {
              person = this.managers.find(m => m._id === participant.participantId);
              return {
                participantId: participant.participantId,
                type: 'Manager',
                name: person ? person.username : 'Unknown Manager'
              };
            }
            return {
              participantId: participant.participantId,
              type: participant.onModel,
              name: 'Unknown'
            };
          })
        };
      }

      this.viewingEvent = event;
    }, 300);
  }

  closeViewModal() {
    const modalElement = document.querySelector('.animate__fadeInDown');
    modalElement?.classList.remove('animate__fadeInDown');
    modalElement?.classList.add('animate__fadeOutUp');
    
    setTimeout(() => {
      this.viewingEvent = null;
    }, 300);
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'N/A';
      
      return date.toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (e) {
      return 'N/A';
    }
  }

  getEventTypeClass(eventType: string): string {
    switch (eventType) {
      case 'Meeting': return 'bg-green-100 text-green-800';
      case 'Project Deadline': return 'bg-yellow-100 text-yellow-800';
      case 'Reminder': return 'bg-blue-100 text-blue-800';
      case 'Holiday': return 'bg-purple-100 text-purple-800';
      case 'Task': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  editEvent(event: any) {
    // Close any open modals first
    if (this.showEventDialog) {
      this.closeAddEventDialog();
    }
    if (this.viewingEvent) {
      this.closeViewModal();
    }

    setTimeout(() => {
      this.eventForm.patchValue({
        title: event.title,
        description: event.description,
        eventType: event.eventType,
        location: event.location,
        eventDate: new Date(event.eventDate).toISOString().slice(0, 16),
      });
      
      this.editingEventId = event._id;
      this.showAddEventDialog = true;
    }, 300);
  }

  deleteEvent(eventId: any): void {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3B82F6',
      cancelButtonColor: '#EF4444',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.developerService.deleteEvent(eventId).subscribe({
          next: () => {
            this.loadEvents();
            Swal.fire({
              icon: 'success',
              title: 'Deleted!',
              text: 'Event has been deleted.',
              confirmButtonColor: '#3B82F6',
              timer: 1500,
              showConfirmButton: false
            });
            this.showEventDialog = false;
          },
          error: (error) => {
            console.error('Error deleting event:', error);
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'Failed to delete event. Please try again.',
              confirmButtonColor: '#3B82F6'
            });
          }
        });
      }
    });
  }

  fetchAllParticipants(): void {
    this.fetchDevelopers();
    this.fetchManagers();
    this.fetchMarketingMembers();
    this.fetchContentCreators();
    this.fetchAdmins();
  }

  fetchDevelopers(): void {
    this.developerService.fetchDevelopers().subscribe({
      next: (response) => {
        this.developers = response;
      },
      error: (error) => {
        console.error('Error fetching developers:', error);
      }
    });
  }

  fetchManagers(): void {
    this.developerService.fetchManagers().subscribe({
      next: (response) => {
        this.managers = response;
      },
      error: (error) => {
        console.error('Error fetching managers:', error);
      }
    });
  }

  fetchMarketingMembers(): void {
    console.log('Fetching marketing members...');
    this.developerService.fetchDigitalMarketingMembers().subscribe({
      next: (response: DigitalMarketingResponse) => {
        console.log('Marketing members response:', response);
        if (response.success) {
          this.marketingMembers = response.data;
          console.log('Updated marketing members:', this.marketingMembers);
        } else {
          console.error('Failed to fetch marketing members: success is false');
        }
      },
      error: (error) => {
        console.error('Error fetching marketing members:', error);
      }
    });
  }

  fetchContentCreators(): void {
    console.log('Fetching content creators...');
    this.developerService.fetchContentCreatorMembers().subscribe({
      next: (response: ContentCreatorResponse) => {
        console.log('Content creators response:', response);
        if (response.success) {
          this.contentCreators = response.data;
          console.log('Updated content creators:', this.contentCreators);
        } else {
          console.error('Failed to fetch content creators: success is false');
        }
      },
      error: (error) => {
        console.error('Error fetching content creators:', error);
      }
    });
  }

  fetchAdmins(): void {
    this.developerService.getAllAdmins().subscribe({
      next: (response: AdminResponse) => {
        this.admins = response;
      },
      error: (error) => {
        console.error('Error fetching admins:', error);
      }
    });
  }

  onEventTypeChange(event: any): void {
    const eventType = event.target.value;
    console.log('Event type changed to:', eventType);
    this.newEvent.eventType = eventType;
    if (eventType !== 'Meeting') {
      this.newEvent.participants = [];
    } else {
      // Refresh participants when Meeting is selected
      this.fetchAllParticipants();
    }
  }

  addParticipant(participantId: string, participantType: string): void {
    if (participantId && !this.newEvent.participants.some((p: { participantId: string; }) => p.participantId === participantId)) {
      this.newEvent.participants.push({
        participantId: participantId,
        onModel: participantType
      });
      this.updateSelectedParticipants();
    }
  }

  removeParticipant(participant: any): void {
    this.newEvent.participants = this.newEvent.participants.filter(
      (p: { participantId: any; onModel: any; }) => !(p.participantId === participant.participantId && p.onModel === participant.onModel)
    );
    this.updateSelectedParticipants();
  }

  updateSelectedParticipants(): void {
    const selectedParticipantsDiv = document.getElementById('selected-participants');
    if (!selectedParticipantsDiv) return;

    selectedParticipantsDiv.innerHTML = '';
    this.newEvent.participants.forEach((participant: any) => {
      const participantName = this.getParticipantName(participant);
      const participantElement = document.createElement('div');
      participantElement.textContent = `${participantName} (${participant.onModel})`;
      selectedParticipantsDiv.appendChild(participantElement);
    });
  }

  getParticipantName(participant: any): string {
    const participantId = participant.participantId;
    
    // Check in each participant array
    const developer = this.developers.find(d => d._id === participantId);
    if (developer) return developer.username;
    
    const manager = this.managers.find(m => m._id === participantId);
    if (manager) return manager.username;
    
    const marketer = this.marketingMembers.find(m => m._id === participantId);
    if (marketer) return marketer.username;
    
    const creator = this.contentCreators.find(c => c._id === participantId);
    if (creator) return creator.username;
    
    const admin = this.admins?.admins.find(a => a._id === participantId);
    if (admin) return admin.username;
    
    return 'Unknown Participant';
  }

  updateEventCounts(): void {
    if (this.events) {
      this.totalEvents = this.events.length;
      
      this.meetingsCount = this.events.filter(event => 
        event.extendedProps?.['eventType']?.toLowerCase() === 'meeting'
      ).length;

      this.tasksCount = this.events.filter(event => 
        event.extendedProps?.['eventType']?.toLowerCase() === 'task'
      ).length;

      const now = new Date();
      const currentMonth = now.getMonth();
      this.monthlyEvents = this.events.filter(event => {
        const eventDate = new Date(event.start as string);
        return eventDate.getMonth() === currentMonth;
      }).length;
    }
  }

  applyFilter(): void {
    const { eventType, startDate, endDate } = this.filterForm.value;
    
    if (!eventType && !startDate && !endDate) {
      this.showErrorAlert('Please select at least one filter criteria');
      return;
    }

    this.filteredEvents = this.events.filter(event => {
      let matchesType = true;
      let matchesDateRange = true;

      if (eventType) {
        matchesType = event.extendedProps?.['eventType'] === eventType;
      }

      if (startDate || endDate) {
        const eventDate = new Date(event.start as string);
        if (startDate) {
          matchesDateRange = matchesDateRange && eventDate >= new Date(startDate);
        }
        if (endDate) {
          matchesDateRange = matchesDateRange && eventDate <= new Date(endDate);
        }
      }

      return matchesType && matchesDateRange;
    });
  }

  private showSuccessAlert(message: string): void {
    Swal.fire({
      title: 'Success',
      text: message,
      icon: 'success',
      confirmButtonColor: '#3085d6'
    });
  }

  private showErrorAlert(message: string): void {
    Swal.fire({
      title: 'Error',
      text: message,
      icon: 'error',
      confirmButtonColor: '#d33'
    });
  }
}
