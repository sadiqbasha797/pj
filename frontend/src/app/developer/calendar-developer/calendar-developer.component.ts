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

@Component({
  selector: 'app-calendar-developer',
  standalone: true,
  imports: [CommonModule, CalendarModule, FullCalendarModule, DialogModule, ButtonModule, FormsModule, InputTextModule, InputTextareaModule, DropdownModule, ReactiveFormsModule],
  templateUrl: './calendar-developer.component.html',
  styleUrl: './calendar-developer.component.css'
})
export class CalendarDeveloperComponent implements OnInit {
  calendarOptions: any;
  events: any[] = [];
  showEventDialog: boolean = false;
  selectedDateEvents: any[] = [];
  selectedDate: string = '';
  showAddEventDialog: boolean = false;
  newEvent: any = {
    title: '',
    description: '',
    eventDate: '',
    eventType: '',
    location: ''
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

  constructor(
    private developerService: DeveloperService,
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
  }

  ngOnInit() {
    this.loadEvents();
    this.initializeCalendar();
    this.fetchDevelopers();
    this.fetchManagers();
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
      dayCellDidMount: this.highlightDatesWithEvents.bind(this)
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
      this.closeEventDialog();
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
      this.closeEventDialog();
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

  fetchDevelopers() {
    this.developerService.fetchDevelopers().subscribe({
      next: (developers) => {
        this.developers = developers;
      },
      error: (error) => console.error('Error fetching developers:', error)
    });
  }

  fetchManagers() {
    this.developerService.fetchManagers().subscribe({
      next: (managers) => {
        this.managers = managers;
      },
      error: (error) => console.error('Error fetching managers:', error)
    });
  }

  closeEventDialog() {
    const modalElement = document.querySelector('.animate__fadeInDown');
    modalElement?.classList.remove('animate__fadeInDown');
    modalElement?.classList.add('animate__fadeOutUp');
    
    setTimeout(() => {
      this.showEventDialog = false;
      this.selectedDate = '';
      this.selectedDateEvents = [];
    }, 300);
  }
}
