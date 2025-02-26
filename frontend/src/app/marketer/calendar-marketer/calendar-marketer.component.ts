import { Component, OnInit } from '@angular/core';
import { CalendarOptions, EventInput, EventClickArg, DateSelectArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin, { DateClickArg } from '@fullcalendar/interaction';
import { MarketerService } from '../../services/marketer.services';
import { LoaderService } from '../../services/loader.service';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { FullCalendarModule } from '@fullcalendar/angular';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';

// Type definition for participant roles
type ParticipantType = 'Developer' | 'Manager' | 'Admin' | 'DigitalMarketingRole' | 'ContentCreator';

@Component({
  selector: 'app-calendar-marketer',
  standalone: true,
  imports: [CommonModule, FullCalendarModule, FormsModule, ReactiveFormsModule],
  templateUrl: './calendar-marketer.component.html',
  styleUrls: ['./calendar-marketer.component.css']
})
export class CalendarMarketerComponent implements OnInit {
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
    dayMaxEvents: true,
  };

  private allEvents: EventInput[] = [];
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
  totalEvents: number = 0;
  meetingsCount: number = 0;
  tasksCount: number = 0;
  monthlyEvents: number = 0;
  events: any;

  eventTypes = ['Meeting', 'Project Deadline', 'Reminder', 'Other', 'Work', 'Holiday', 'Task'];
  filterForm: FormGroup;
  filteredEvents: any[] = [];
  showFilterModal = false;

  // Add this property to store logged-in user info
  loggedInUser: any;

  marketingMembers: any[] = [];
  contentCreators: any[] = [];
  developers: any[] = [];
  managers: any[] = [];
  admins: any[] = [];

  constructor(
    private marketerService: MarketerService,
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

    // Get logged-in user info from localStorage
    const userString = localStorage.getItem('marketerInfo');
    this.loggedInUser = userString ? JSON.parse(userString) : null;
  }

  ngOnInit(): void {
    this.fetchAllParticipants();
    this.fetchEvents();
    this.updateEventCounts();
  }

  private fetchAllParticipants(): void {
    this.fetchMarketingMembers();
    this.fetchContentCreators();
    this.fetchDevelopers();
    this.fetchManagers();
    this.fetchAdmins();
  }

  fetchMarketingMembers(): void {
    this.marketerService.getAllMarketingMembers().subscribe({
      next: (response) => {
        this.marketingMembers = response.data || [];
      },
      error: (error) => {
        console.error('Error fetching marketing members:', error);
      }
    });
  }

  fetchContentCreators(): void {
    this.marketerService.getAllContentCreators().subscribe({
      next: (response) => {
        this.contentCreators = response.data || [];
      },
      error: (error) => {
        console.error('Error fetching content creators:', error);
      }
    });
  }

  fetchDevelopers(): void {
    this.marketerService.getAllDevelopers().subscribe({
      next: (response) => {
        this.developers = response || [];
      },
      error: (error) => {
        console.error('Error fetching developers:', error);
      }
    });
  }

  fetchManagers(): void {
    this.marketerService.getAllManagers().subscribe({
      next: (response) => {
        this.managers = response || [];
      },
      error: (error) => {
        console.error('Error fetching managers:', error);
      }
    });
  }

  fetchAdmins(): void {
    this.marketerService.getAllAdmins().subscribe({
      next: (response) => {
        this.admins = response.admins || [];
      },
      error: (error) => {
        console.error('Error fetching admins:', error);
      }
    });
  }

  onEventTypeChange(event: any): void {
    const eventType = event.target.value;
    this.newEvent.eventType = eventType;
    if (eventType !== 'Meeting') {
      this.newEvent.participants = [];
    }
  }

  addParticipant(participantId: string, participantType: ParticipantType): void {
    if (participantId && !this.newEvent.participants.some((p: any) => 
      p.participantId === participantId && p.onModel === participantType)) {
      // Ensure correct model name is used
      const onModel = participantType === 'DigitalMarketingRole' ? 'DigitalMarketingRole' : participantType;
      this.newEvent.participants.push({
        participantId: participantId,
        onModel: onModel
      });
    }
  }

  removeParticipant(participant: any): void {
    this.newEvent.participants = this.newEvent.participants.filter(
      (p: any) => !(p.participantId === participant.participantId && p.onModel === participant.onModel)
    );
  }

  getParticipantName(participant: any): string {
    if (participant.participantId && participant.participantId.username) {
      return participant.participantId.username;
    }
    return 'Unknown';
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

  addEvent(eventData: any): void {
    this.loaderService.show();
    this.marketerService.addEvent(eventData).subscribe({
      next: (response) => {
        this.showSuccessAlert('Event created successfully');
        this.fetchEvents();
        this.closeCreateModal();
        this.resetForm();
      },
      error: (error) => {
        console.error('Error creating event:', error);
        this.showErrorAlert('Failed to create event. Please try again.');
      },
      complete: () => {
        this.loaderService.hide();
      }
    });
  }

  fetchEvents(): void {
    const userId = localStorage.getItem('userId');
    console.log(userId);
    this.loaderService.show();
    this.marketerService.getMarketingEvents().subscribe({
      next: (response) => {
        // Store original events for counts
        this.events = response.data;
        
        // Map events for calendar display
        this.allEvents = response.data.map((event: any) => ({
          id: event._id,
          title: event.title,
          start: event.eventDate,
          end: event.endDate || event.eventDate,
          allDay: event.isAllDay,
          extendedProps: {
            description: event.description,
            eventType: event.eventType,
            participants: event.participants,
            projectId: event.projectId,
            location: event.location,
            status: event.status,
            createdAt: event.createdAt,
            updatedAt: event.updatedAt
          }
        }));

        // Update the calendar events
        this.calendarOptions.events = this.getEventCounts.bind(this);
        
        // Update the count cards
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
    const eventsByDate = this.allEvents.reduce((acc: { [key: string]: any[] }, event) => {
      const date = new Date(event.start as string).toDateString();
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(event);
      return acc;
    }, {});

    const events = Object.entries(eventsByDate).map(([dateStr, dateEvents]) => {
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
    this.selectedDate = new Date(arg.date);
    this.eventsOnSelectedDate = this.allEvents.filter(event => {
      const eventDate = new Date(event.start as string);
      return eventDate.toDateString() === this.selectedDate?.toDateString();
    });
    this.showEventListModal = true;
  }

  viewEvent(eventId: string): void {
    const event = this.allEvents.find(e => e.id === eventId);
    if (event) {
      this.closeFilterModal();
      
      setTimeout(() => {
        this.viewingEvent = event;
        this.showEventListModal = false;
      }, 300);
    }
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

  getStatusClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  updateEventCounts(): void {
    if (this.events) {
      this.totalEvents = this.events.length;
      this.meetingsCount = this.events.filter((e: { eventType: string; }) => e.eventType === 'Meeting').length;
      this.tasksCount = this.events.filter((e: { eventType: string; }) => 
        e.eventType === 'Task' || e.eventType === 'Project Deadline'
      ).length;
      
      const currentMonth = new Date().getMonth();
      this.monthlyEvents = this.events.filter((e: { eventDate: string | number | Date; }) => 
        new Date(e.eventDate).getMonth() === currentMonth
      ).length;
    }
  }

  // Modal handling methods
  closeViewModal() {
    const modalElement = document.querySelector('.animate__fadeInDown');
    modalElement?.classList.remove('animate__fadeInDown');
    modalElement?.classList.add('animate__fadeOutUp');
    
    setTimeout(() => {
      this.viewingEvent = null;
    }, 300);
  }

  closeEventListModal(): void {
    const modalElement = document.querySelector('.animate__fadeInDown');
    modalElement?.classList.remove('animate__fadeInDown');
    modalElement?.classList.add('animate__fadeOutUp');
    
    setTimeout(() => {
      this.showEventListModal = false;
      this.selectedDate = null;
      this.eventsOnSelectedDate = [];
    }, 300);
  }

  closeFilterModal(): void {
    const modalElement = document.querySelector('.animate__fadeInDown');
    modalElement?.classList.remove('animate__fadeInDown');
    modalElement?.classList.add('animate__fadeOutUp');
    
    setTimeout(() => {
      this.showFilterModal = false;
      this.filterForm.reset();
    }, 300);
  }

  // Alert methods
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

  // Add Event Methods
  openCreateModal(): void {
    this.showCreateModal = true;
    this.eventForm.reset({
      title: '',
      description: '',
      eventType: '',
      location: '',
      eventDate: '',
      status: 'Active'
    });
  }

  closeCreateModal(): void {
    const modalElement = document.querySelector('.animate__fadeInDown');
    modalElement?.classList.remove('animate__fadeInDown');
    modalElement?.classList.add('animate__fadeOutUp');
    
    setTimeout(() => {
      this.showCreateModal = false;
      this.eventForm.reset();
    }, 300);
  }

  createEvent(): void {
    if (this.eventForm.valid) {
      this.loaderService.show();
      const formData = new FormData();
      
      Object.keys(this.eventForm.value).forEach(key => {
        formData.append(key, this.eventForm.value[key]);
      });

      this.marketerService.addEvent(this.eventForm.value).subscribe({
        next: (response) => {
          this.showSuccessAlert('Event created successfully');
          this.closeCreateModal();
          this.fetchEvents(); // Refresh events
          this.loaderService.hide();
        },
        error: (error) => {
          console.error('Error creating event:', error);
          this.showErrorAlert('Failed to create event');
          this.loaderService.hide();
        }
      });
    }
  }

  // Update Event Methods
  openEditModal(event: any): void {
    this.editingEvent = event;
    this.showEditModal = true;
    
    this.eventForm.patchValue({
      title: event.title,
      description: event.extendedProps?.description,
      eventType: event.extendedProps?.eventType,
      location: event.extendedProps?.location,
      eventDate: new Date(event.start).toISOString().split('T')[0],
      status: event.extendedProps?.status
    });
  }

  closeEditModal(): void {
    const modalElement = document.querySelector('.animate__fadeInDown');
    modalElement?.classList.remove('animate__fadeInDown');
    modalElement?.classList.add('animate__fadeOutUp');
    
    setTimeout(() => {
      this.showEditModal = false;
      this.editingEvent = null;
      this.eventForm.reset();
    }, 300);
  }

  updateEvent(eventId: string, eventData: any): void {
    this.loaderService.show();
    this.marketerService.updateEvent(eventId, eventData).subscribe({
      next: (response) => {
        this.showSuccessAlert('Event updated successfully');
        this.fetchEvents();
        this.closeEditModal();
        this.resetForm();
      },
      error: (error) => {
        console.error('Error updating event:', error);
        this.showErrorAlert('Failed to update event. Please try again.');
      },
      complete: () => {
        this.loaderService.hide();
      }
    });
  }

  // Delete Event Method
  deleteEvent(eventId: string): void {
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
        this.marketerService.deleteEvent(eventId).subscribe({
          next: (response) => {
            this.showSuccessAlert('Event deleted successfully');
            this.fetchEvents(); // Refresh events
            this.loaderService.hide();
          },
          error: (error) => {
            console.error('Error deleting event:', error);
            this.showErrorAlert('Failed to delete event');
            this.loaderService.hide();
          }
        });
      }
    });
  }

  // Filter Methods
  openFilterModal(): void {
    this.showFilterModal = true;
  }

  applyFilter(): void {
    const { eventType, startDate, endDate } = this.filterForm.value;
    
    if (!eventType && !startDate && !endDate) {
      this.showErrorAlert('Please select at least one filter criteria');
      return;
    }

    this.filteredEvents = this.allEvents.filter(event => {
      let matchesType = true;
      let matchesDateRange = true;

      // Check event type
      if (eventType) {
        matchesType = event.extendedProps?.['eventType'] === eventType;
      }

      // Check date range
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

  openCreateModalWithDate(date: Date): void {
    this.showCreateModal = true;
    const formattedDate = new Date(date).toISOString().slice(0, 16); // Format date for datetime-local input
    
    this.eventForm.reset({
      title: '',
      description: '',
      eventType: '',
      location: '',
      eventDate: formattedDate,
      status: 'Active'
    });
  }

  // Add this method to check if user can edit/delete
  isEventCreator(event: any): boolean {
    // Get both userId and userRole from localStorage
    const userId = localStorage.getItem('userId');
    const userRole = localStorage.getItem('userRole');
    
    // Get createdBy ID from either format (calendar event or API response)
    const createdById = event.extendedProps?.createdBy?._id || event.createdBy?._id;
    const eventModel = event.extendedProps?.onModel || event.onModel;
    
    if (!userId || !createdById) {
      console.log('Missing userId or createdById:', { userId, createdById });
      return false;
    }
    
    // For debugging
    console.log('Comparing IDs:', {
      userId,
      createdById,
      userRole,
      eventModel,
      match: userId === createdById || userRole?.toLowerCase() === eventModel?.toLowerCase()
    });
    
    return userId === createdById || userRole?.toLowerCase() === eventModel?.toLowerCase();
  }

  private resetForm(): void {
    this.eventForm.reset();
    this.newEvent = {
      title: '',
      description: '',
      eventType: '',
      location: '',
      participants: [],
      eventDate: '',
      status: 'Active'
    };
  }
}
