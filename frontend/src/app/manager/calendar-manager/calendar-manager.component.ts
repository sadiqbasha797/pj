import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ManagerService } from '../../services/manager.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FullCalendarModule, FullCalendarComponent } from '@fullcalendar/angular';
import { CalendarOptions, EventClickArg, EventInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin, { DateClickArg } from '@fullcalendar/interaction';
import Swal from 'sweetalert2';
import { forkJoin } from 'rxjs';

interface CalendarEvent {
  _id: string;
  title: string;
  description: string;
  eventDate: Date;
  endDate?: Date;
  createdBy: string;
  status: 'Active' | 'Not-Active';
  onModel: 'Admin' | 'Manager' | 'Developer';
  participants: {
    participantId: string;
    onModel: 'Admin' | 'Manager' | 'Developer';
  }[];
  location?: string;
  eventType: 'Meeting' | 'Project Deadline' | 'Reminder' | 'Other' | 'Work' | 'Holiday' | 'Task';
  projectId?: string;
  isAllDay: boolean;
}

@Component({
  selector: 'app-calendar-manager',
  standalone: true,
  imports: [
    CommonModule, 
    FullCalendarModule, 
    FormsModule, 
    ReactiveFormsModule
  ],
  templateUrl: './calendar-manager.component.html',
  styleUrl: './calendar-manager.component.css'
})
export class CalendarManagerComponent implements OnInit, AfterViewInit {
  participants: any;
  formatDate(arg0: any) {
    throw new Error('Method not implemented.');
  }
  closeEventListModal() {
    const modalElement = document.querySelector('.animate__fadeInDown');
    modalElement?.classList.remove('animate__fadeInDown');
    modalElement?.classList.add('animate__fadeOutUp');
    
    setTimeout(() => {
      this.showEventListModal = false;
      this.selectedDate = null;
      this.eventsOnSelectedDate = [];
    }, 300);
  }

  events: CalendarEvent[] = [];
  managerId: string = '';
  assignedDevelopers: string[] = [];
  developers: any[] = [];
  calendarEvents: EventInput[] = [];
  totalEvents: number = 0;
  meetingsCount: number = 0;
  tasksCount: number = 0;
  monthlyEvents: number = 0;
  
  // Modal states
  showEventListModal = false;
  showEditModal = false;
  showCreateModal = false;
  showFilterModal = false;
  viewingEvent: any = null;
  selectedDate: Date | null = null;
  eventsOnSelectedDate: any[] = [];
  
  // Forms
  eventForm: FormGroup;
  filterForm: FormGroup;
  newEvent: any = {
    participants: []
  };

  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    weekends: true,
    events: this.calendarEvents,
    dateClick: this.handleDateClick.bind(this),
    eventClick: (arg: EventClickArg) => {
      const eventId = arg.event.id;
      const event = this.events.find(e => e._id === eventId);
      if (event) {
        this.viewEvent(event);
      }
    },
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,dayGridWeek,dayGridDay'
    },
    datesSet: this.handleDatesSet.bind(this),
    displayEventTime: true,
    eventTimeFormat: {
      hour: '2-digit',
      minute: '2-digit',
      meridiem: 'short'
    },
    dayMaxEvents: 2,
    eventDisplay: 'auto',
    eventContent: (arg) => {
      const eventEl = document.createElement('div');
      eventEl.className = 'flex items-center gap-1 p-1 rounded-md text-xs';
      eventEl.style.backgroundColor = arg.event.backgroundColor || '#4CAF50';
      
      const icon = document.createElement('span');
      icon.className = 'material-icons text-xs';
      icon.innerHTML = this.getEventIcon(arg.event.extendedProps?.['type'] || '');
      icon.style.color = 'white';
      
      const title = document.createElement('span');
      title.innerHTML = arg.event.title;
      title.style.color = 'white';
      title.style.whiteSpace = 'nowrap';
      title.style.overflow = 'hidden';
      title.style.textOverflow = 'ellipsis';
      
      eventEl.appendChild(icon);
      eventEl.appendChild(title);
      
      return { domNodes: [eventEl] };
    }
  };

  @ViewChild(FullCalendarComponent) calendarComponent: FullCalendarComponent | undefined;

  filteredEvents: any[] = [];
  eventTypes = ['Meeting', 'Project Deadline', 'Reminder', 'Work', 'Holiday', 'Task'];

  // Add new properties
  digitalMarketingMembers: any[] = [];
  contentCreatorMembers: any[] = [];
  admins: any[] = [];
  isLoading: boolean = true;

  constructor(
    private managerService: ManagerService,
    private fb: FormBuilder
  ) {
    this.eventForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      eventType: ['', Validators.required],
      location: [''],
      eventDate: ['', Validators.required],
      status: ['Active']
    });

    this.filterForm = this.fb.group({
      eventType: [''],
      startDate: [''],
      endDate: ['']
    });
  }

  ngOnInit() {
    console.log('Component initialized');
    this.initializeForms();
    this.loadManagerProfile();
    
    // Initialize calendar options
    this.calendarOptions = {
      ...this.calendarOptions,
      events: this.calendarEvents,
      initialView: 'dayGridMonth',
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,dayGridWeek,dayGridDay'
      },
      plugins: [dayGridPlugin, interactionPlugin],
      editable: false,
      selectable: true,
      displayEventTime: true,
      eventTimeFormat: {
        hour: '2-digit',
        minute: '2-digit',
        meridiem: 'short'
      },
      dayMaxEvents: true,
      eventDisplay: 'block',
      eventClick: this.handleEventClick.bind(this),
      dateClick: this.handleDateClick.bind(this)
    };

    // Load events after initialization
    this.loadEvents();
  }

  fetchManagers() {
    throw new Error('Method not implemented.');
  }

  setupCalendar() {
    throw new Error('Method not implemented.');
  }

  private initializeForms() {
    this.eventForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      eventType: ['Meeting', Validators.required],
      location: [''],
      eventDate: ['', Validators.required],
      endDate: [''],
      isAllDay: [false]
    });

    this.filterForm = this.fb.group({
      eventType: [''],
      startDate: [''],
      endDate: ['']
    });
  }

  private loadManagerProfile() {
    this.managerService.getManagerProfile().subscribe({
      next: (profile) => {
        this.managerId = profile._id;
        this.assignedDevelopers = profile.developers.map(dev => dev.developerId);
        this.loadEvents();
      },
      error: (error) => console.error('Error loading manager profile:', error)
    });
  }

  public loadEvents(): void {
    this.managerService.getAllEvents().subscribe({
      next: (events: CalendarEvent[]) => {
        this.events = events.filter(event => 
          event.createdBy === this.managerId ||
          event.participants.some(p => p.participantId === this.managerId) ||
          event.participants.some(p => this.assignedDevelopers.includes(p.participantId))
        );
        
        // Transform events and update calendar
        this.calendarEvents = this.transformEventsForCalendar(this.events);
        if (this.calendarComponent) {
          this.calendarComponent.getApi().removeAllEvents();
          this.calendarComponent.getApi().addEventSource(this.calendarEvents);
        }
        this.updateEventCounts();
      },
      error: (error) => console.error('Error loading events:', error)
    });
  }

  private fetchDevelopers() {
    this.managerService.getAllDevelopers().subscribe({
      next: (response: any) => {
        // Store all developers directly from the array response
        this.developers = response || [];
        
        // Log for debugging
        console.log('Fetched developers:', this.developers);
        
        // Filter developers if assignedDevelopers is populated
        if (this.assignedDevelopers?.length > 0) {
          this.developers = this.developers.filter(dev => 
            this.assignedDevelopers.includes(dev._id)
          );
        }
      },
      error: (error) => {
        console.error('Error fetching developers:', error);
        this.showErrorAlert('Failed to load developers');
      }
    });
  }

  // Event Handlers
  handleDateClick(arg: DateClickArg) {
    this.selectedDate = arg.date;
    
    // Filter events for the selected date
    this.eventsOnSelectedDate = this.events.filter(event => {
      const eventDate = new Date(event.eventDate);
      return eventDate.toDateString() === arg.date.toDateString();
    });

    // Show the event list modal
    this.showEventListModal = true;
    this.showCreateModal = false;
    this.showEditModal = false;
    this.showFilterModal = false;
  }

  handleEventClick(arg: EventClickArg) {
    console.log('Event clicked:', arg.event);
    const eventId = arg.event.id;
    const event = this.events.find(e => e._id === eventId);
    if (event) {
      this.viewEvent(event);
    }
  }

  // Modal Management
  private closeAllModals() {
    this.showCreateModal = false;
    this.showEditModal = false;
    this.showFilterModal = false;
    this.showEventListModal = false;
    this.viewingEvent = null;
  }

  openCreateModal() {
    this.closeAllModals();
    this.showCreateModal = true;
    
    // Get current date and time
    const now = new Date();
    const currentDateTime = this.formatDateForInput(now);
    
    this.eventForm.reset({
      title: '',
      description: '',
      eventType: 'Meeting',
      location: '',
      eventDate: currentDateTime,
      status: 'Active'
    });

    this.newEvent = {
      participants: []
    };
  }

  openEditModal(event: any) {
    this.closeAllModals();
    this.showEditModal = true;
    this.viewingEvent = event;
    
    // Convert dates to proper format for form
    const eventDate = new Date(event.eventDate || event.start);
    const endDate = event.endDate ? new Date(event.endDate) : null;

    this.eventForm.patchValue({
      title: event.title,
      description: event.extendedProps?.description || event.description,
      eventType: event.extendedProps?.eventType || event.eventType,
      location: event.extendedProps?.location || event.location,
      eventDate: eventDate.toISOString().slice(0, 16),
      endDate: endDate ? endDate.toISOString().slice(0, 16) : null,
      status: event.extendedProps?.status || event.status || 'Active'
    });

    // Set participants
    this.newEvent.participants = [...(event.extendedProps?.participants || event.participants || [])];
  }

  openFilterModal() {
    this.showFilterModal = true;
    this.filteredEvents = [];
    this.filterForm.reset();
  }

  openCreateModalFromList() {
    this.closeAllModals();
    this.showCreateModal = true;
    
    // Format the selected date for the form
    const selectedDateTime = this.selectedDate ? this.formatDateForInput(this.selectedDate) : '';
    
    // Reset the form with the selected date
    this.eventForm.reset({
      title: '',
      description: '',
      eventType: 'Meeting', // or whatever default you prefer
      location: '',
      eventDate: selectedDateTime,
      status: 'Active'
    });

    // Reset participants
    this.newEvent = {
      participants: []
    };
  }

  viewEvent(event: CalendarEvent) {
    this.closeAllModals();
    this.viewingEvent = event;
    if (event.projectId) {
      this.managerService.getProject(event.projectId).subscribe({
        next: (project) => {
          this.viewingEvent.project = project;
        },
        error: (error) => console.error('Error loading project details:', error)
      });
    }
  }

  closeCreateModal() {
    this.showCreateModal = false;
    this.eventForm.reset();
    this.newEvent = {
      participants: []
    };
  }

  closeEditModal() {
    this.showEditModal = false;
    this.eventForm.reset();
    this.newEvent = {
      participants: []
    };
  }

  closeFilterModal() {
    const modalElement = document.querySelector('.animate__fadeInDown');
    modalElement?.classList.remove('animate__fadeInDown');
    modalElement?.classList.add('animate__fadeOutUp');
    
    setTimeout(() => {
      this.showFilterModal = false;
      this.filterForm.reset();
      this.filteredEvents = [];
    }, 300);
  }

  // Event CRUD Operations
  addEvent(eventData: any) {
    this.managerService.addEvent(eventData).subscribe({
      next: () => {
        this.loadEvents();
        this.closeCreateModal();
        this.showSuccessAlert('Event added successfully');
      },
      error: (error) => {
        console.error('Error adding event:', error);
        this.showErrorAlert('Failed to add event');
      }
    });
  }

  deleteEvent(eventId: string) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'This action cannot be undone',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.managerService.deleteEvent(eventId).subscribe({
          next: () => {
            this.loadEvents();
            this.showSuccessAlert('Event deleted successfully');
          },
          error: (error) => {
            console.error('Error deleting event:', error);
            this.showErrorAlert('Failed to delete event');
          }
        });
      }
    });
  }

  // Participant Management
  addParticipant(participantId: string, onModel: string) {
    if (!participantId) return;
    
    // Prevent duplicate participants
    const isDuplicate = this.newEvent.participants.some(
      (      p: { participantId: string; onModel: string; }) => p.participantId === participantId && p.onModel === onModel
    );
    
    if (!isDuplicate) {
      this.newEvent.participants.push({
        participantId,
        onModel
      });
    }
  }

  removeParticipant(participant: any) {
    this.newEvent.participants = this.newEvent.participants.filter(
      (      p: { participantId: any; }) => p.participantId !== participant.participantId
    );
  }

  // Filter Management
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
        matchesType = event.eventType === eventType;
      }

      if (startDate || endDate) {
        const eventDate = new Date(event.eventDate);
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

  showInfoAlert(arg0: string) {
    throw new Error('Method not implemented.');
  }

  resetFilters(): void {
    this.filterForm.reset();
    this.filteredEvents = [];
    this.loadEvents(); // Reload all events
    this.closeFilterModal();
  }

  // Utility Methods
  private transformEventsForCalendar(events: CalendarEvent[]): EventInput[] {
    return events.map(event => ({
      id: event._id,
      title: event.title,
      start: new Date(event.eventDate), // Ensure proper date conversion
      end: event.endDate ? new Date(event.endDate) : undefined,
      allDay: event.isAllDay || false,
      backgroundColor: this.getEventColor(event.eventType),
      borderColor: this.getEventColor(event.eventType),
      textColor: '#FFFFFF',
      extendedProps: {
        type: event.eventType,
        description: event.description,
        location: event.location
      }
    }));
  }

  getEventTypeClass(eventType: string): string {
    switch (eventType) {
      case 'Meeting': return 'bg-green-100 text-green-800';
      case 'Project Deadline': return 'bg-yellow-100 text-yellow-800';
      case 'Reminder': return 'bg-blue-100 text-blue-800';
      case 'Work': return 'bg-purple-100 text-purple-800';
      case 'Holiday': return 'bg-indigo-100 text-indigo-800';
      case 'Task': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  private updateEventCounts() {
    this.totalEvents = this.events.length;
    this.meetingsCount = this.events.filter(e => e.eventType === 'Meeting').length;
    this.tasksCount = this.events.filter(e => 
      e.eventType === 'Task' || e.eventType === 'Project Deadline'
    ).length;
    
    const currentMonth = new Date().getMonth();
    this.monthlyEvents = this.events.filter(e => 
      new Date(e.eventDate).getMonth() === currentMonth
    ).length;
  }

  private showSuccessAlert(message: string) {
    Swal.fire({
      icon: 'success',
      title: 'Success',
      text: message,
      timer: 2000,
      showConfirmButton: false
    });
  }

  private showErrorAlert(message: string) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: message
    });
  }

  getParticipantName(participant: any): string {
    console.log('Getting name for participant:', participant);
    
    switch (participant.onModel) {
      case 'Developer':
        const dev = this.developers.find(d => d._id === participant.participantId);
        return dev ? dev.username : 'Unknown Developer';
      
      case 'digital-marketing':
        const dm = this.digitalMarketingMembers.find(d => d._id === participant.participantId);
        console.log('Found marketing member:', dm);
        return dm ? dm.username : 'Unknown Marketing Member';
      
      case 'content-creator':
        const cc = this.contentCreatorMembers.find(d => d._id === participant.participantId);
        console.log('Found content creator:', cc);
        return cc ? cc.username : 'Unknown Content Creator';
      
      default:
        console.warn('Unknown participant type:', participant.onModel);
        return 'Unknown';
    }
  }

  handleEventSubmit() {
    if (this.eventForm.invalid) {
      this.showErrorAlert('Please fill in all required fields');
      return;
    }

    const eventData = {
      ...this.eventForm.value,
      participants: this.newEvent.participants,
      createdBy: this.managerId,
      onModel: 'Manager',
      status: 'Active'
    };

    // If end date is not provided, set it same as event date
    if (!eventData.endDate) {
      eventData.endDate = eventData.eventDate;
    }

    // Handle create/update based on modal state
    if (this.showEditModal && this.viewingEvent) {
      this.updateEvent(this.viewingEvent._id, eventData);
    } else {
      this.addEvent(eventData);
    }
  }

  updateEvent(eventId: string, eventData: any) {
    this.managerService.updateEvent(eventId, eventData).subscribe({
      next: () => {
        this.loadEvents();
        this.closeEditModal();
        this.showSuccessAlert('Event updated successfully');
      },
      error: (error) => {
        console.error('Error updating event:', error);
        this.showErrorAlert('Failed to update event');
      }
    });
  }

  private handleDatesSet(arg: any): void {
    console.log('Calendar dates set:', arg);
    console.log('Current events:', this.calendarEvents);
  }

  private handleDatesRendered() {
    // Remove this line
    // this.colorEventDates();
  }

  // Add this method to check if the current manager created the event
  canManageEvent(event: any): boolean {
    return event.createdBy === this.managerId && event.onModel === 'Manager';
  }

  // Helper method to format date for datetime-local input
  private formatDateForInput(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  // Add these new methods
  private fetchDigitalMarketingMembers() {
    console.log('Fetching digital marketing members...');
    return new Promise((resolve) => {
      this.managerService.getAllDigitalMarketingMembers().subscribe({
        next: (response) => {
          console.log('Digital marketing response:', response);
          if (response.success) {
            this.digitalMarketingMembers = response.data;
            console.log('Digital marketing members loaded:', this.digitalMarketingMembers);
          }
          resolve(true);
        },
        error: (error) => {
          console.error('Error fetching digital marketing members:', error);
          this.showErrorAlert('Failed to load digital marketing members');
          resolve(false);
        }
      });
    });
  }

  private fetchContentCreatorMembers() {
    console.log('Fetching content creators...');
    return new Promise((resolve) => {
      this.managerService.getAllContentCreatorMembers().subscribe({
        next: (response) => {
          console.log('Content creators response:', response);
          if (response.success) {
            this.contentCreatorMembers = response.data;
            console.log('Content creators loaded:', this.contentCreatorMembers);
          }
          resolve(true);
        },
        error: (error) => {
          console.error('Error fetching content creators:', error);
          this.showErrorAlert('Failed to load content creators');
          resolve(false);
        }
      });
    });
  }

  loadUsers() {
    this.isLoading = true;
    
    forkJoin({
      managers: this.managerService.getAllManagers(),
      developers: this.managerService.getAllDevelopers(),
      admins: this.managerService.getAllAdmins(),
      digitalMarketing: this.managerService.getAllDigitalMarketingMembers(),
      contentCreators: this.managerService.getAllContentCreatorMembers()
    }).subscribe({
      next: (response) => {
        // ... existing user mappings ...
        this.admins = response.admins.admins.map((user: { _id: any; username: any; email: any; }) => ({
          _id: user._id,
          username: user.username,
          role: 'admin',
          email: user.email
        }));
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.isLoading = false;
      }
    });
  }

  private getEventColor(eventType: string): string {
    switch (eventType) {
      case 'Meeting':
        return '#4CAF50'; // green
      case 'Project Deadline':
        return '#FFC107'; // amber
      case 'Reminder':
        return '#2196F3'; // blue
      case 'Work':
        return '#9C27B0'; // purple
      case 'Holiday':
        return '#3F51B5'; // indigo
      case 'Task':
        return '#FF5722'; // deep orange
      default:
        return '#757575'; // grey
    }
  }

  private getEventIcon(eventType: string): string {
    switch (eventType) {
      case 'Meeting':
        return 'groups';
      case 'Project Deadline':
        return 'assignment';
      case 'Reminder':
        return 'notifications';
      case 'Work':
        return 'work';
      case 'Holiday':
        return 'celebration';
      case 'Task':
        return 'task';
      default:
        return 'event';
    }
  }

  // Add this method to check if events are properly loaded
  ngAfterViewInit() {
    console.log('Calendar component:', this.calendarComponent);
    console.log('Initial events:', this.calendarEvents);
  }
}
