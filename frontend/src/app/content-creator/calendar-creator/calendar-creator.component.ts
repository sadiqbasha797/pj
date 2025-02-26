import { Component, OnInit } from '@angular/core';
import { CalendarOptions, EventInput, EventClickArg, DateSelectArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin, { DateClickArg } from '@fullcalendar/interaction';
import { CreatorService } from '../../services/creator.service';
import { LoaderService } from '../../services/loader.service';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { FullCalendarModule } from '@fullcalendar/angular';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';

// Type definition for participant types
type ParticipantType = 'Developer' | 'Manager' | 'Client' | 'DigitalMarketingRole' | 'ContentCreator' | 'Admin';

@Component({
  selector: 'app-calendar-creator',
  standalone: true,
  imports: [CommonModule, FullCalendarModule, FormsModule, ReactiveFormsModule],
  templateUrl: './calendar-creator.component.html',
  styleUrls: ['./calendar-creator.component.css']
})
export class CalendarCreatorComponent implements OnInit {
  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,dayGridWeek,dayGridDay'
    },
    themeSystem: 'standard',
    height: 'auto',
    contentHeight: 'auto',
    buttonText: {
      today: 'Today',
      month: 'M',
      week: 'W',
      day: 'D',
    },
    views: {
      dayGridMonth: {
        titleFormat: { year: 'numeric', month: 'short' },
        dayHeaderFormat: { weekday: 'narrow' },
      },
      dayGridWeek: {
        titleFormat: { year: 'numeric', month: 'short' },
        dayHeaderFormat: { weekday: 'short' },
      },
      dayGridDay: {
        titleFormat: { year: 'numeric', month: 'short', day: 'numeric' },
        dayHeaderFormat: { weekday: 'short' },
      }
    },
    events: this.getEventCounts.bind(this),
    dateClick: this.handleDateClick.bind(this),
    eventContent: (arg) => {
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
    eventDidMount: (info) => {
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
    dayCellDidMount: (arg) => {
      arg.el.style.transition = 'all 0.2s ease';
      arg.el.addEventListener('mouseenter', () => {
        arg.el.style.backgroundColor = '#F8FAFC';
      });
      arg.el.addEventListener('mouseleave', () => {
        arg.el.style.backgroundColor = '';
      });
    },
    eventDisplay: 'list-item',
    dayMaxEventRows: 3,
    dayMaxEvents: 3,
    displayEventEnd: false,
    moreLinkContent: (args) => {
      return {
        html: `<div class="more-events">+${args.num} more</div>`
      };
    },
  };

  private allEvents: EventInput[] = [];
  developers: any[] = [];
  managers: any[] = [];
  marketingMembers: any[] = [];
  contentCreators: any[] = [];
  clients: any[] = [];
  
  newEvent: any = {
    title: '',
    description: '',
    eventType: '',
    location: '',
    participants: [],
    eventDate: '',
    status: 'Active'
  };

  viewingEvent: any = null;
  eventProject: any = null;
  showEventListModal = false;
  showEditModal = false;
  showCreateModal = false;
  selectedDate: Date | null = null;
  eventsOnSelectedDate: any[] = [];
  editingEvent: any = null;
  eventForm: FormGroup;
  filterForm: FormGroup;
  
  totalEvents: number = 0;
  meetingsCount: number = 0;
  tasksCount: number = 0;
  monthlyEvents: number = 0;
  events: any;

  eventTypes = ['Meeting', 'Project Deadline', 'Reminder', 'Other', 'Work', 'Holiday', 'Task'];
  filteredEvents: any[] = [];
  showFilterModal = false;

  currentUserId: string = localStorage.getItem('userId') || '';
  admins: any[] = [];

  constructor(
    private creatorService: CreatorService,
    private loaderService: LoaderService,
    private fb: FormBuilder
  ) {
    this.eventForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      eventType: ['', Validators.required],
      location: [''],
      eventDate: ['', Validators.required]
    });

    this.filterForm = this.fb.group({
      eventType: [''],
      startDate: [''],
      endDate: ['']
    });
  }

  ngOnInit(): void {
    this.fetchEvents();
    this.fetchAllParticipants();
    this.updateEventCounts();
  }

  // Fetch all necessary participants
  private fetchAllParticipants(): void {
    this.fetchDevelopers();
    this.fetchManagers();
    this.fetchMarketingMembers();
    this.fetchContentCreators();
    this.fetchAdmins();
  }

  // Fetch events specific to content creator
  fetchEvents(): void {
    this.loaderService.show();
    this.creatorService.getContentCreatorEvents().subscribe({
      next: (response: any) => {
        const events = response.data || [];
        this.events = events;
        
        this.allEvents = events.map((event: any) => ({
          id: event._id,
          title: event.title,
          start: new Date(event.eventDate),
          end: event.endDate ? new Date(event.endDate) : new Date(event.eventDate),
          allDay: event.isAllDay || false,
          extendedProps: {
            description: event.description,
            eventType: event.eventType,
            participants: event.participants,
            projectId: event.projectId?._id,
            projectTitle: event.projectId?.title,
            location: event.location,
            status: event.status,
            createdBy: event.createdBy,
            createdAt: event.createdAt,
            updatedAt: event.updatedAt
          }
        }));

        this.calendarOptions.events = this.allEvents;
        this.updateEventCounts();
        this.loaderService.hide();
      },
      error: (error) => {
        console.error('Error fetching events:', error);
        this.loaderService.hide();
        this.showErrorAlert('Failed to fetch events');
      }
    });
  }

  getEventCounts(fetchInfo: any, successCallback: any, failureCallback: any) {
    // Group events by date
    const eventsByDate = this.allEvents.reduce((acc: { [key: string]: any[] }, event) => {
      const date = new Date(event.start as string).toDateString();
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(event);
      return acc;
    }, {});

    // Process events for display
    const events = Object.entries(eventsByDate).map(([dateStr, dateEvents]) => {
      // Take only first 3 events for display
      const displayEvents = dateEvents.slice(0, 3).map(event => {
        const eventTypeStyles = this.getEventStyles(event.extendedProps?.['eventType']);
        return {
          start: event.start,
          title: event.title,
          allDay: true,
          display: 'list-item',
          backgroundColor: eventTypeStyles.bgColor,
          textColor: eventTypeStyles.textColor,
          borderColor: eventTypeStyles.borderColor,
          classNames: ['event-item'],
          extendedProps: {
            icon: eventTypeStyles.icon
          }
        };
      });

      // Add "+more" link if there are more than 3 events
      if (dateEvents.length > 3) {
        displayEvents.push({
          start: dateEvents[0].start,
          title: `+${dateEvents.length - 3} more`,
          allDay: true,
          display: 'list-item',
          backgroundColor: '#F3F4F6',
          textColor: '#6B7280',
          borderColor: '#E5E7EB',
          classNames: ['more-events'],
          extendedProps: {
            icon: '📅'
          }
        });
      }

      return displayEvents;
    }).flat();

    successCallback(events);
  }

  getEventStyles(eventType: string): { bgColor: string; textColor: string; borderColor: string; icon: string } {
    switch (eventType?.toLowerCase()) {
      case 'meeting':
        return {
          bgColor: '#EFF6FF',
          textColor: '#3B82F6',
          borderColor: '#93C5FD',
          icon: '🤝'
        };
      case 'project deadline':
        return {
          bgColor: '#FEF2F2',
          textColor: '#EF4444',
          borderColor: '#FCA5A5',
          icon: '⏰'
        };
      case 'reminder':
        return {
          bgColor: '#ECFDF5',
          textColor: '#10B981',
          borderColor: '#6EE7B7',
          icon: '📝'
        };
      case 'holiday':
        return {
          bgColor: '#FDF2F8',
          textColor: '#EC4899',
          borderColor: '#F9A8D4',
          icon: '🎉'
        };
      case 'task':
        return {
          bgColor: '#FEF3C7',
          textColor: '#D97706',
          borderColor: '#FCD34D',
          icon: '📋'
        };
      default:
        return {
          bgColor: '#F3F4F6',
          textColor: '#6B7280',
          borderColor: '#E5E7EB',
          icon: '📅'
        };
    }
  }

  handleDateClick(arg: DateClickArg): void {
    const clickedDate = new Date(arg.date);
    this.selectedDate = clickedDate;
    
    // Filter events for the clicked date
    this.eventsOnSelectedDate = this.allEvents.filter(event => {
      const eventDate = new Date(event.start as string);
      return eventDate.toDateString() === clickedDate.toDateString();
    });

    this.showEventListModal = true;
  }

  // Participant fetching methods
  fetchDevelopers(): void {
    this.creatorService.getAllDevelopers().subscribe({
      next: (response) => {
        this.developers = response;
      },
      error: (error) => {
        console.error('Error fetching developers:', error);
      }
    });
  }

  fetchManagers(): void {
    this.creatorService.getAllManagers().subscribe({
      next: (response) => {
        this.managers = response;
      },
      error: (error) => {
        console.error('Error fetching managers:', error);
      }
    });
  }

  fetchMarketingMembers(): void {
    this.creatorService.getAllDigitalMarketingMembers().subscribe({
      next: (response: any) => {
        this.marketingMembers = response.data || [];
      },
      error: (error) => {
        console.error('Error fetching marketing members:', error);
      }
    });
  }

  fetchContentCreators(): void {
    this.creatorService.getAllContentCreatorMembers().subscribe({
      next: (response: any) => {
        this.contentCreators = response.data || [];
      },
      error: (error) => {
        console.error('Error fetching content creators:', error);
      }
    });
  }

  fetchAdmins(): void {
    this.creatorService.getAllAdmins().subscribe({
      next: (response: any) => {
        this.admins = response.admins || [];
      },
      error: (error) => {
        console.error('Error fetching admins:', error);
      }
    });
  }

  // Event CRUD operations
  addEvent(eventData: any): void {
    this.loaderService.show();
    this.creatorService.addEvent(eventData).subscribe({
      next: (response) => {
        this.fetchEvents();
        this.loaderService.hide();
        this.showSuccessAlert('Event added successfully');
        this.closeEditCreateModal();
      },
      error: (error) => {
        console.error('Error adding event:', error);
        this.loaderService.hide();
        this.showErrorAlert('Failed to add event');
      }
    });
  }

  updateEvent(eventId: string, eventData: any): void {
    this.loaderService.show();
    this.creatorService.updateEvent(eventId, eventData).subscribe({
      next: (response) => {
        this.fetchEvents();
        this.loaderService.hide();
        this.showSuccessAlert('Event updated successfully');
        this.closeEditCreateModal();
      },
      error: (error) => {
        console.error('Error updating event:', error);
        this.loaderService.hide();
        this.showErrorAlert('Failed to update event');
      }
    });
  }

  deleteEvent(eventId: string): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'This action cannot be undone',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.loaderService.show();
        this.creatorService.deleteEvent(eventId).subscribe({
          next: () => {
            this.fetchEvents();
            this.loaderService.hide();
            this.showSuccessAlert('Event deleted successfully');
            this.closeEventListModal();
          },
          error: (error) => {
            console.error('Error deleting event:', error);
            this.loaderService.hide();
            this.showErrorAlert('Failed to delete event');
          }
        });
      }
    });
  }

  // Add these helper methods to close all modals
  private closeAllModals(): void {
    this.showCreateModal = false;
    this.showEditModal = false;
    this.showEventListModal = false;
    this.showFilterModal = false;
    this.viewingEvent = null;
    this.editingEvent = null;
  }

  // Update the existing modal methods
  openCreateModal(): void {
    this.closeAllModals();
    const now = new Date();
    this.newEvent = {
      title: '',
      description: '',
      eventType: '',
      location: '',
      participants: [],
      eventDate: now.toISOString().slice(0, 16),
      status: 'Active'
    };
    this.showCreateModal = true;
  }

  openEditModal(event: any): void {
    if (event) {
      this.closeAllModals();
      const eventDate = new Date(event.start);
      const formattedDate = eventDate.toISOString().slice(0, 16);

      this.showEditModal = true;
      
      this.eventForm.patchValue({
        title: event.title,
        description: event.extendedProps?.description || '',
        eventType: event.extendedProps?.eventType || '',
        location: event.extendedProps?.location || '',
        eventDate: formattedDate,
      });

      this.editingEvent = event;
      this.newEvent = {
        ...event,
        participants: event.extendedProps?.participants || []
      };
    }
  }

  openFilterModal(): void {
    this.closeAllModals();
    this.showFilterModal = true;
    this.filterForm.reset();
    this.filteredEvents = [];
  }

  viewEvent(eventId: string): void {
    const event = this.allEvents.find(e => e.id === eventId);
    if (event) {
      this.closeAllModals();
      this.viewingEvent = event;
    }
  }

  // Update the close methods to use animations
  closeEditCreateModal(): void {
    const modalElement = document.querySelector('.animate__fadeInDown');
    modalElement?.classList.remove('animate__fadeInDown');
    modalElement?.classList.add('animate__fadeOutUp');
    
    setTimeout(() => {
      this.closeAllModals();
      this.newEvent = {
        title: '',
        description: '',
        eventType: '',
        location: '',
        participants: [],
        eventDate: '',
        status: 'Active'
      };
    }, 300);
  }

  closeEventListModal(): void {
    const modalElement = document.querySelector('.animate__fadeInDown');
    modalElement?.classList.remove('animate__fadeInDown');
    modalElement?.classList.add('animate__fadeOutUp');
    
    setTimeout(() => {
      this.closeAllModals();
      this.selectedDate = null;
      this.eventsOnSelectedDate = [];
    }, 300);
  }

  closeFilterModal(): void {
    const modalElement = document.querySelector('.animate__fadeInDown');
    modalElement?.classList.remove('animate__fadeInDown');
    modalElement?.classList.add('animate__fadeOutUp');
    
    setTimeout(() => {
      this.closeAllModals();
      this.filterForm.reset();
    }, 300);
  }

  closeViewModal(): void {
    const modalElement = document.querySelector('.animate__fadeInDown');
    modalElement?.classList.remove('animate__fadeInDown');
    modalElement?.classList.add('animate__fadeOutUp');
    
    setTimeout(() => {
      this.closeAllModals();
    }, 300);
  }

  handleEventSubmit(): void {
    if (this.eventForm.valid) {
      const formData = this.eventForm.value;
      const eventDate = new Date(formData.eventDate).toISOString();
      
      const eventData = {
        ...formData,
        eventDate: eventDate,
        participants: this.newEvent.participants
      };

      if (this.showEditModal && this.editingEvent) {
        this.updateEvent(this.editingEvent.id, eventData);
      } else {
        this.addEvent(eventData);
      }
    }
  }

  onEventTypeChange(event: any): void {
    const eventType = event.target.value;
    this.newEvent.eventType = eventType;
    if (eventType !== 'Meeting') {
      this.newEvent.participants = [];
    }
  }

  addParticipant(participantId: string, participantType: ParticipantType): void {
    if (participantId && !this.newEvent.participants.some((p: { participantId: string; }) => p.participantId === participantId)) {
      this.newEvent.participants.push({
        participantId: participantId,
        onModel: participantType
      });
    }
  }

  removeParticipant(participant: any): void {
    this.newEvent.participants = this.newEvent.participants.filter(
      (      p: { participantId: any; onModel: any; }) => !(p.participantId === participant.participantId && p.onModel === participant.onModel)
    );
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
    // Check if participantId exists and contains the nested user data
    if (participant.participantId && participant.participantId.username) {
      return participant.participantId.username;
    }
    return 'Unknown';
  }

  updateEventCounts(): void {
    if (this.allEvents) {
      this.totalEvents = this.allEvents.length;
      
      // Count meetings
      this.meetingsCount = this.allEvents.filter(event => 
        event.extendedProps?.['eventType']?.toLowerCase() === 'meeting'
      ).length;

      // Count tasks
      this.tasksCount = this.allEvents.filter(event => 
        event.extendedProps?.['eventType']?.toLowerCase() === 'task'
      ).length;

      // Count events for current month
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      
      this.monthlyEvents = this.allEvents.filter(event => {
        const eventDate = new Date(event.start as string);
        return eventDate.getMonth() === currentMonth;
      }).length;
    }
  }

  // Filter methods
  applyFilter(): void {
    const { eventType, startDate, endDate } = this.filterForm.value;
    
    if (!eventType && !startDate && !endDate) {
      this.showErrorAlert('Please select at least one filter criteria');
      return;
    }

    this.filteredEvents = this.allEvents.filter(event => {
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

  // Utility methods
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

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getEventTypeClass(eventType: string): string {
    switch (eventType?.toLowerCase()) {
      case 'meeting':
        return 'bg-blue-100 text-blue-800';
      case 'project deadline':
        return 'bg-red-100 text-red-800';
      case 'reminder':
        return 'bg-green-100 text-green-800';
      case 'holiday':
        return 'bg-pink-100 text-pink-800';
      case 'task':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  editEventFromView(event: any): void {
    this.closeViewModal();
    setTimeout(() => {
      this.openEditModal(event);
    }, 300);
  }

  isEventOwner(event: any): boolean {
    return event?.extendedProps?.createdBy?._id === this.currentUserId;
  }
}
