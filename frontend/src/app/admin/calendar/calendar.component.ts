import { Component, OnInit } from '@angular/core';
import { CalendarOptions, EventInput, EventClickArg, DateSelectArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin, { DateClickArg } from '@fullcalendar/interaction';
import { AdminService } from '../../services/admin.service';
import { LoaderService } from '../../services/loader.service';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { FullCalendarModule } from '@fullcalendar/angular';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule, FormGroup, FormBuilder } from '@angular/forms';

// Add this type definition at the top of the file, outside the component class
type ParticipantType = 'Developer' | 'Manager' | 'Client' | 'DigitalMarketingRole' | 'ContentCreator';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, FullCalendarModule, FormsModule, ReactiveFormsModule],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css']
})
export class CalendarComponent implements OnInit {
  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,dayGridWeek,dayGridDay'
    },
    events: this.getEventCounts.bind(this),
    dateClick: this.handleDateClick.bind(this),
    eventContent: this.renderEventContent,
    dayCellDidMount: this.highlightDatesWithEvents.bind(this),
  };

  private allEvents: EventInput[] = [];
  developers: any[] = [];
  managers: any[] = [];
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
  clients: any[] = [];
  marketingMembers: any[] = [];
  contentCreators: any[] = [];

  constructor(
    private adminService: AdminService,
    private loaderService: LoaderService,
    private fb: FormBuilder  // Add FormBuilder
  ) {
    this.eventForm = this.fb.group({
      title: [''],
      description: [''],
      eventType: [''],
      location: [''],
      eventDate: [''],
      // remove status from form
    });

    // Initialize filter form
    this.filterForm = this.fb.group({
      eventType: [''],
      startDate: [''],
      endDate: ['']
    });
  }

  ngOnInit(): void {
    this.fetchEvents();
    this.fetchDevelopers();
    this.fetchManagers();
    this.fetchClients();
    this.fetchMarketingMembers();
    this.fetchContentCreators();
    this.updateEventCounts();
  }

  fetchEvents(): void {
    this.loaderService.show();
    this.adminService.getAllEvents().subscribe({
      next: (events) => {
        // Store original events for counts
        this.events = events;
        
        // Map events for calendar display
        this.allEvents = events.map((event: any) => ({
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
    const events = this.allEvents.reduce((acc: any[], event) => {
      const date = new Date(event.start as string).toDateString();
      const existingEvent = acc.find(e => new Date(e.start as string).toDateString() === date);
      if (existingEvent) {
        existingEvent.title = String(parseInt(existingEvent.title) + 1);
      } else {
        acc.push({
          start: event.start,
          title: '1',
          allDay: true,
          display: 'background',
          backgroundColor: 'rgba(0, 255, 0, 0.1)', // Light green with reduced opacity
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
      arg.el.style.backgroundColor = 'rgba(0, 255, 0, 0.1)'; // Light green with reduced opacity
    }
  }

  handleDateClick(arg: DateClickArg): void {
    this.selectedDate = arg.date;
    this.eventsOnSelectedDate = this.allEvents.filter(event => 
      new Date(event.start as string).toDateString() === arg.date.toDateString()
    );
    this.showEventListModal = true;
  }

  getEventsForDate(date: Date): EventInput[] {
    return this.allEvents.filter(event => 
      new Date(event.start as string).toDateString() === date.toDateString()
    );
  }

  showEventsModal(date: Date, events: EventInput[]): void {
    const eventsList = events.map(event => 
      `<div class="event-card bg-white p-4 rounded-lg shadow-md mb-4 text-left"> <!-- Add text-left class here -->
        <div class="flex justify-between items-start mb-2">
          <h3 class="text-lg font-semibold">${event.title}</h3>
          <span class="px-3 py-1 text-xs font-semibold rounded-full ${this.getEventTypeClass(event.extendedProps?.['eventType'])}">
            ${event.extendedProps?.['eventType'] || 'N/A'}
          </span>
        </div>
        <p class="text-gray-600 mb-4">${event.extendedProps?.['description'] || 'No description'}</p>
        <div class="flex justify-end space-x-2">
          <button class="p-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition duration-300" onclick="viewEvent('${event.id}')">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" />
            </svg>
          </button>
          <button class="p-2 bg-green-50 text-green-600 rounded-md hover:bg-green-100 transition duration-300" onclick="editEvent('${event.id}')">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
          <button class="p-2 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition duration-300" onclick="deleteEvent('${event.id}')">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
      </div>`
    ).join('');

    Swal.fire({
      title: `Events on ${date.toLocaleDateString()}`,
      html: `
        <div class="max-h-[70vh] overflow-y-auto">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            ${eventsList}
          </div>
        </div>
        <button class="mt-4 px-4 py-2 bg-blue-500 text-white rounded" onclick="addNewEvent()">Add New Event</button>
      `,
      showConfirmButton: false,
      showCloseButton: true,
      width: '80%',
      customClass: {
        container: 'swal-wide',
        popup: 'swal-popup',
      },
      didOpen: () => {
        const popup = Swal.getPopup();
        if (popup) {
          popup.style.maxHeight = '90vh';
          popup.style.overflowY = 'auto';
        }
      }
    });

    (window as any).viewEvent = (eventId: string) => this.viewEvent(eventId);
    (window as any).editEvent = (eventId: string) => this.editEvent(eventId);
    (window as any).deleteEvent = (eventId: string) => this.deleteEvent(eventId);
    (window as any).addNewEvent = () => {
      Swal.close();
      this.showAddEventModal(date);
    };
  }

  viewEvent(eventId: string): void {
    const event = this.allEvents.find(e => e.id === eventId);
    if (event) {
      this.closeFilterModal();
      
      setTimeout(() => {
        this.viewingEvent = event;
        this.showEventListModal = false;
        
        if (event.extendedProps?.['projectId']) {
          this.adminService.getProject(event.extendedProps['projectId']).subscribe({
            next: (response) => {
              this.eventProject = response.project;
            },
            error: (error) => {
              console.error('Error fetching project details:', error);
              this.eventProject = null;
            }
          });
        } else {
          this.eventProject = null;
        }
      }, 300);
    }
  }

  closeViewModal() {
    const modalElement = document.querySelector('.animate__fadeInDown');
    modalElement?.classList.remove('animate__fadeInDown');
    modalElement?.classList.add('animate__fadeOutUp');
    
    setTimeout(() => {
      this.viewingEvent = null;
    }, 300);
  }

  editEventFromView(event: any) {
    const eventToEdit = event;
    this.closeViewModal();
    setTimeout(() => {
      this.openEditModal(eventToEdit);
    }, 300);
  }

  getParticipantName(participant: any): string {
    const { participantId, onModel } = participant;
    
    switch (onModel) {
      case 'Developer':
        return this.developers.find(dev => dev._id === participantId)?.username || 'Unknown Developer';
      case 'Manager':
        return this.managers.find(manager => manager._id === participantId)?.username || 'Unknown Manager';
      case 'Client':
        return this.clients.find(client => client._id === participantId)?.clientName || 'Unknown Client';
      case 'DigitalMarketingRole':
        return this.marketingMembers.find(member => member._id === participantId)?.username || 'Unknown Marketing Member';
      case 'ContentCreator':
        return this.contentCreators.find(creator => creator._id === participantId)?.username || 'Unknown Content Creator';
      default:
        return 'Unknown Participant';
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

  editEvent(eventId: string): void {
    const event = this.allEvents.find(e => e.id === eventId);
    if (event) {
      // Format the date for the datetime-local input
      const eventDate = new Date(event.start as string);
      const formattedDate = eventDate.toISOString().slice(0, 16); // Format: "YYYY-MM-DDThh:mm"

      this.newEvent = { 
        ...event,
        eventDate: formattedDate // Store the formatted date
      };

      Swal.fire({
        title: 'Edit Event',
        html: `
          <input id="swal-input1" class="swal2-input" placeholder="Title" value="${event.title}">
          <input id="swal-input2" class="swal2-input" placeholder="Description" value="${event.extendedProps?.['description'] || ''}">
          <select id="swal-input3" class="swal2-select">
            ${this.getEventTypeOptions(event.extendedProps?.['eventType'])}
          </select>
          <input id="swal-input4" class="swal2-input" placeholder="Location" value="${event.extendedProps?.['location'] || ''}">
          <div id="participants-container" style="display: ${event.extendedProps?.['eventType'] === 'Meeting' ? 'block' : 'none'};">
            <select id="swal-input5" class="swal2-select">
              <option value="">Select a developer</option>
              ${this.developers.map(dev => `<option value="${dev._id}">${dev.username}</option>`).join('')}
            </select>
            <button type="button" id="add-developer-btn" class="swal2-confirm swal2-styled">Add Developer</button>
            <select id="swal-input6" class="swal2-select">
              <option value="">Select a manager</option>
              ${this.managers.map(manager => `<option value="${manager._id}">${manager.username}</option>`).join('')}
            </select>
            <button type="button" id="add-manager-btn" class="swal2-confirm swal2-styled">Add Manager</button>
          </div>
          <input id="swal-input7" class="swal2-input" type="datetime-local" value="${formattedDate}">
          <select id="swal-input8" class="swal2-select">
            <option value="Active" ${event.extendedProps?.['status'] === 'Active' ? 'selected' : ''}>Active</option>
            <option value="Not-Active" ${event.extendedProps?.['status'] === 'Not-Active' ? 'selected' : ''}>Not Active</option>
          </select>
        `,
        focusConfirm: false,
        didOpen: () => {
          const eventTypeSelect = document.getElementById('swal-input3') as HTMLSelectElement;
          const participantsContainer = document.getElementById('participants-container');
          eventTypeSelect.addEventListener('change', (event) => {
            if ((event.target as HTMLSelectElement).value === 'Meeting') {
              participantsContainer!.style.display = 'block';
            } else {
              participantsContainer!.style.display = 'none';
            }
          });

          const addDeveloperBtn = document.getElementById('add-developer-btn');
          addDeveloperBtn!.addEventListener('click', () => {
            const developerSelect = document.getElementById('swal-input5') as HTMLSelectElement;
            const selectedDeveloperId = developerSelect.value;
            if (selectedDeveloperId) {
              this.newEvent.participants.push({ participantId: selectedDeveloperId, onModel: 'Developer' });
              developerSelect.value = '';
            }
          });

          const addManagerBtn = document.getElementById('add-manager-btn');
          addManagerBtn!.addEventListener('click', () => {
            const managerSelect = document.getElementById('swal-input6') as HTMLSelectElement;
            const selectedManagerId = managerSelect.value;
            if (selectedManagerId) {
              this.newEvent.participants.push({ participantId: selectedManagerId, onModel: 'Manager' });
              managerSelect.value = '';
            }
          });
        },
        preConfirm: () => {
          return {
            title: (document.getElementById('swal-input1') as HTMLInputElement).value,
            description: (document.getElementById('swal-input2') as HTMLInputElement).value,
            eventType: (document.getElementById('swal-input3') as HTMLSelectElement).value,
            location: (document.getElementById('swal-input4') as HTMLInputElement).value,
            participants: this.newEvent.participants,
            eventDate: (document.getElementById('swal-input7') as HTMLInputElement).value,
            status: (document.getElementById('swal-input8') as HTMLSelectElement).value
          };
        }
      }).then((result) => {
        if (result.isConfirmed) {
          this.updateEvent(eventId, result.value);
          this.newEvent.participants = []; // Reset participants array
        }
      });
    }
  }

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
        this.adminService.deleteEvent(eventId).subscribe({
          next: () => {
            this.fetchEvents();
            this.showSuccessAlert('Event deleted successfully');
            this.closeEventListModal();
          },
          error: (error) => {
            console.error('Error deleting event:', error);
            this.showErrorAlert('Failed to delete event');
          }
        });
      }
    });
  }

  showAddEventModal(date: Date): void {
    let participantsHtml = '';
    Swal.fire({
      title: 'Add New Event',
      html: `
        <input id="swal-input1" class="swal2-input" placeholder="Title">
        <input id="swal-input2" class="swal2-input" placeholder="Description">
        <select id="swal-input3" class="swal2-select">
          ${this.getEventTypeOptions()}
        </select>
        <input id="swal-input4" class="swal2-input" placeholder="Location">
        <div id="participants-container" style="display: none;">
          <select id="swal-input5" class="swal2-select">
            <option value="">Select a developer</option>
            ${this.developers.map(dev => `<option value="${dev._id}">${dev.username}</option>`).join('')}
          </select>
          <button type="button" id="add-developer-btn" class="swal2-confirm swal2-styled">Add Developer</button>
          <select id="swal-input6" class="swal2-select">
            <option value="">Select a manager</option>
            ${this.managers.map(manager => `<option value="${manager._id}">${manager.username}</option>`).join('')}
          </select>
          <button type="button" id="add-manager-btn" class="swal2-confirm swal2-styled">Add Manager</button>
          <div id="selected-participants"></div>
        </div>
        <input id="swal-input7" class="swal2-input" type="datetime-local" value="${date.toISOString().slice(0, 16)}">
        <select id="swal-input8" class="swal2-select">
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
      `,
      focusConfirm: false,
      didOpen: () => {
        const eventTypeSelect = document.getElementById('swal-input3') as HTMLSelectElement;
        const participantsContainer = document.getElementById('participants-container');
        eventTypeSelect.addEventListener('change', (event) => {
          if ((event.target as HTMLSelectElement).value === 'Meeting') {
            participantsContainer!.style.display = 'block';
          } else {
            participantsContainer!.style.display = 'none';
          }
        });

        const addDeveloperBtn = document.getElementById('add-developer-btn');
        addDeveloperBtn!.addEventListener('click', () => {
          const developerSelect = document.getElementById('swal-input5') as HTMLSelectElement;
          const selectedDeveloperId = developerSelect.value;
          if (selectedDeveloperId && !this.newEvent.participants.some((p: any) => p.participantId === selectedDeveloperId)) {
            this.newEvent.participants.push({ participantId: selectedDeveloperId, onModel: 'Developer' });
            this.updateSelectedParticipants();
            developerSelect.value = '';
          }
        });

        const addManagerBtn = document.getElementById('add-manager-btn');
        addManagerBtn!.addEventListener('click', () => {
          const managerSelect = document.getElementById('swal-input6') as HTMLSelectElement;
          const selectedManagerId = managerSelect.value;
          if (selectedManagerId && !this.newEvent.participants.some((p: any) => p.participantId === selectedManagerId)) {
            this.newEvent.participants.push({ participantId: selectedManagerId, onModel: 'Manager' });
            this.updateSelectedParticipants();
            managerSelect.value = '';
          }
        });
      },
      preConfirm: () => {
        return {
          title: (document.getElementById('swal-input1') as HTMLInputElement).value,
          description: (document.getElementById('swal-input2') as HTMLInputElement).value,
          eventType: (document.getElementById('swal-input3') as HTMLSelectElement).value,
          location: (document.getElementById('swal-input4') as HTMLInputElement).value,
          participants: this.newEvent.participants,
          eventDate: (document.getElementById('swal-input7') as HTMLInputElement).value,
          status: (document.getElementById('swal-input8') as HTMLSelectElement).value
        };
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.addEvent(result.value);
        this.newEvent.participants = []; // Reset participants array
      }
    });
  }

  addEvent(eventData: any): void {
    this.loaderService.show();
    this.adminService.addEvent(eventData).subscribe({
      next: (response) => {
        this.fetchEvents();
        this.loaderService.hide();
        this.showSuccessAlert('Event added successfully');
      },
      error: (error) => {
        console.error('Error adding event:', error);
        this.loaderService.hide();
        this.showErrorAlert('Failed to add event');
      }
    });
  }

  updateEvent(eventId: string, eventData: any): void {
    // Ensure we're sending the correct date format
    const updatedEventData = {
      ...eventData,
      eventDate: new Date(eventData.eventDate).toISOString() // Convert to ISO string
    };

    this.loaderService.show();
    this.adminService.updateEvent(eventId, updatedEventData).subscribe({
      next: (response) => {
        this.fetchEvents();
        this.loaderService.hide();
        this.showSuccessAlert('Event updated successfully');
      },
      error: (error) => {
        console.error('Error updating event:', error);
        this.loaderService.hide();
        this.showErrorAlert('Failed to update event');
      }
    });
  }

  renderEventContent(eventInfo: any) {
    return { html: `<b>${eventInfo.event.title}</b>` };
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

  getEventTypeOptions(selectedType?: string): string {
    const types = ['Meeting', 'Reminder', 'Holiday', 'Other'];
    return types.map(type => 
      `<option value="${type}" ${type === selectedType ? 'selected' : ''}>${type}</option>`
    ).join('');
  }

  fetchDevelopers(): void {
    this.adminService.getAllDevelopers().subscribe({
      next: (developers) => {
        this.developers = developers;
      },
      error: (error) => {
        console.error('Error fetching developers:', error);
      }
    });
  }

  fetchManagers(): void {
    this.adminService.getAllManagers().subscribe({
      next: (managers) => {
        this.managers = managers;
      },
      error: (error) => {
        console.error('Error fetching managers:', error);
      }
    });
  }

  private showSuccessAlert(message: string): void {
    Swal.fire('Success', message, 'success');
  }

  private showErrorAlert(message: string): void {
    Swal.fire('Error', message, 'error');
  }

  updateSelectedParticipants() {
    const selectedParticipantsDiv = document.getElementById('selected-participants');
    if (!selectedParticipantsDiv) return;

    selectedParticipantsDiv.innerHTML = '';

    this.newEvent.participants.forEach((participant: any) => {
      const participantName = this.getParticipantName(participant);

      const participantElement = document.createElement('div');
      participantElement.textContent = `${participantName} (${participant.onModel})`;

      const removeButton = document.createElement('button');
      removeButton.textContent = 'Remove';
      removeButton.addEventListener('click', () => {
        this.newEvent.participants = this.newEvent.participants.filter(
          (p: any) => !(p.participantId === participant.participantId && p.onModel === participant.onModel)
        );
        this.updateSelectedParticipants();
      });

      participantElement.appendChild(removeButton);
      selectedParticipantsDiv.appendChild(participantElement);
    });
  }

  openCreateModal(): void {
    const now = new Date();
    const defaultTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    this.newEvent = {
      title: '',
      description: '',
      eventType: '',
      location: '',
      participants: [],
      eventDate: defaultTime,
      status: 'Active'
    };
    
    this.eventForm.patchValue({
      eventDate: defaultTime
    });
    
    this.showCreateModal = true;
    this.showEventListModal = false;
  }

  openEditModal(event: any): void {
    if (event) {
      // Format the date for the datetime-local input
      const eventDate = new Date(event.start);
      const formattedDate = eventDate.toISOString().slice(0, 16); // Format: "YYYY-MM-DDThh:mm"

      this.showEditModal = true;
      this.showEventListModal = false;
      
      // Set the form values
      this.eventForm.patchValue({
        title: event.title,
        description: event.extendedProps?.description || '',
        eventType: event.extendedProps?.eventType || '',
        location: event.extendedProps?.location || '',
        eventDate: formattedDate, // Use the formatted date
        status: event.extendedProps?.status || 'Active'
      });

      // Store the event ID for updating
      this.editingEvent = event;
      this.newEvent = {
        ...event,
        participants: event.extendedProps?.participants || []
      };
    }
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

  closeEditCreateModal(): void {
    const modalElement = document.querySelector('.animate__fadeInDown');
    modalElement?.classList.remove('animate__fadeInDown');
    modalElement?.classList.add('animate__fadeOutUp');
    
    setTimeout(() => {
      this.showEditModal = false;
      this.showCreateModal = false;
      this.editingEvent = null;
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

  handleEventSubmit(): void {
    if (this.eventForm.valid) {
      const formData = this.eventForm.value;
      
      // Ensure the date is properly formatted
      const eventDate = new Date(formData.eventDate).toISOString();
      
      const eventData = {
        ...formData,
        eventDate: eventDate,
        participants: this.newEvent.participants
      };

      if (this.showEditModal && this.editingEvent) {
        // Update existing event
        this.updateEvent(this.editingEvent.id, eventData);
      } else {
        // Create new event
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

  addParticipant(participantId: string, onModel: ParticipantType): void {
    if (!participantId) return;

    // Check if participant already exists
    const exists = this.newEvent.participants.some(
      (p: any) => p.participantId === participantId && p.onModel === onModel
    );

    if (!exists) {
      this.newEvent.participants.push({ participantId, onModel });
    }
  }

  removeParticipant(participant: any): void {
    this.newEvent.participants = this.newEvent.participants.filter(
      (p: any) => p.participantId !== participant.participantId
    );
  }

  updateEventCounts(): void {
    if (this.events) {
      // Total Events
      this.totalEvents = this.events.length;

      // Meetings Count
      this.meetingsCount = this.events.filter((e: { eventType: string; }) => e.eventType === 'Meeting').length;

      // Tasks Count (including Project Deadlines)
      this.tasksCount = this.events.filter((e: { eventType: string; }) => 
        e.eventType === 'Task' || e.eventType === 'Project Deadline'
      ).length;

      // Monthly Events
      const currentMonth = new Date().getMonth();
      this.monthlyEvents = this.events.filter((e: { eventDate: string | number | Date; }) => 
        new Date(e.eventDate).getMonth() === currentMonth
      ).length;
    }
  }

  openFilterModal(): void {
    this.showFilterModal = true;
    this.filterForm.reset();
    this.filteredEvents = [];
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

  fetchClients(): void {
    this.adminService.getAllClients().subscribe({
      next: (response) => {
        this.clients = response.clients;
      },
      error: (error) => {
        console.error('Error fetching clients:', error);
      }
    });
  }

  fetchMarketingMembers(): void {
    this.adminService.getAllDigitalMarketingMembers().subscribe({
      next: (response) => {
        this.marketingMembers = response.data;
      },
      error: (error) => {
        console.error('Error fetching marketing members:', error);
      }
    });
  }

  fetchContentCreators(): void {
    this.adminService.getAllContentCreatorMembers().subscribe({
      next: (response) => {
        this.contentCreators = response.data;
      },
      error: (error) => {
        console.error('Error fetching content creators:', error);
      }
    });
  }
}
