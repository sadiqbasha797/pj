import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RecruitmentService } from '../services/recruitment.service';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';

@Component({
  selector: 'app-recruitment',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './recruitment.component.html',
  styleUrl: './recruitment.component.css'
})
export class RecruitmentComponent implements OnInit {
  // Active tab tracking
  activeTab: string = 'jobs';

  // Forms
  jobForm!: FormGroup;
  candidateForm!: FormGroup;
  interviewForm!: FormGroup;
  offerLetterForm!: FormGroup;

  // Data lists
  jobs: any[] = [];
  candidates: any[] = [];
  interviews: any[] = [];
  offerLetters: any[] = [];

  // Selected items for editing
  selectedJob: any = null;
  selectedCandidate: any = null;
  selectedInterview: any = null;
  selectedOfferLetter: any = null;

  // Loading states
  isLoading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  // Form visibility states
  jobFormVisible: boolean = false;
  candidateFormVisible: boolean = false;
  interviewFormVisible: boolean = false;
  offerLetterFormVisible: boolean = false;

  // New properties
  showStatusModal: boolean = false;
  selectedInterviewForStatus: any = null;
  interviewStatusOptions: string[] = ['scheduled', 'completed', 'cancelled', 'rescheduled'];

  constructor(
    private recruitmentService: RecruitmentService,
    private fb: FormBuilder
  ) {
    this.initializeForms();
    this.clearMessages();
  }

  ngOnInit() {
    this.loadAllData();
  }

  private initializeForms() {
    // Job Form
    this.jobForm = this.fb.group({
      role: ['', Validators.required],
      salaryOffered: this.fb.group({
        min: ['', Validators.required],
        max: ['', Validators.required],
        currency: ['USD', Validators.required]
      }),
      vacancies: ['', [Validators.required, Validators.min(1)]],
      description: ['', Validators.required],
      dates: this.fb.group({
        deadline: ['', Validators.required]
      }),
      status: ['active']
    });

    // Candidate Form
    this.candidateForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      resume: ['', Validators.required],
      jobId: ['', Validators.required],
      education: this.fb.array([]),
      skills: this.fb.array([]),
      address: this.fb.group({
        street: [''],
        city: [''],
        state: [''],
        country: [''],
        pincode: ['']
      })
    });

    // Interview Form
    this.interviewForm = this.fb.group({
      name: ['', Validators.required],
      candidate: this.fb.group({
        id: ['', Validators.required],
        name: [''],
        email: ['']
      }),
      interviewDate: ['', Validators.required],
      interviewStatus: ['scheduled'],
      interviewLink: [''],
      additionalNotes: [''],
      feedback: this.fb.group({
        rating: [null],
        comments: [''],
        technicalScore: [null],
        communicationScore: [null]
      })
    });

    // Offer Letter Form
    this.offerLetterForm = this.fb.group({
      candidate: this.fb.group({
        id: ['', Validators.required],
        name: [''],
        email: ['']
      }),
      jobId: [''],
      offerDate: [new Date().toISOString().split('T')[0]],
      joiningDate: ['', Validators.required],
      offerDetails: this.fb.group({
        position: ['', Validators.required],
        salary: [null, [Validators.required, Validators.min(1)]],
        benefits: [[]],
        location: ['', Validators.required]
      }),
      validTill: ['', Validators.required]
    });
  }

  private loadAllData() {
    this.loadJobs();
    this.loadCandidates();
    this.loadInterviews();
    this.loadOfferLetters();
  }

  // Jobs Methods
  loadJobs() {
    this.isLoading = true;
    this.recruitmentService.getAllJobs().subscribe({
      next: (response) => {
        this.jobs = response.jobs;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Error loading jobs';
        this.isLoading = false;
      }
    });
  }

  onSubmitJob() {
    if (this.jobForm.valid) {
      this.isLoading = true;
      const jobData = this.jobForm.value;
      
      if (this.selectedJob) {
        this.recruitmentService.updateJob(this.selectedJob._id, jobData).subscribe({
          next: (response) => {
            this.handleSuccess('Job updated successfully');
            this.loadJobs();
            this.resetJobForm();
          },
          error: (error) => this.handleError(error, 'Error updating job'),
          complete: () => this.isLoading = false
        });
      } else {
        this.recruitmentService.createJob(jobData).subscribe({
          next: (response) => {
            this.handleSuccess('Job created successfully');
            this.loadJobs();
            this.resetJobForm();
          },
          error: (error) => this.handleError(error, 'Error creating job'),
          complete: () => this.isLoading = false
        });
      }
    }
  }

  editJob(job: any) {
    this.selectedJob = job;
    this.jobFormVisible = true;
    this.jobForm.patchValue({
      role: job.role,
      salaryOffered: {
        min: job.salaryOffered.min,
        max: job.salaryOffered.max,
        currency: job.salaryOffered.currency
      },
      vacancies: job.vacancies,
      description: job.description,
      dates: {
        deadline: this.formatDate(job.dates.deadline)
      },
      status: job.status
    });
  }

  // Candidates Methods
  loadCandidates() {
    this.isLoading = true;
    this.recruitmentService.getAllCandidates().subscribe({
      next: (response) => {
        this.candidates = response.candidates;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Error loading candidates: ' + (error.error?.message || error.message);
        this.isLoading = false;
      }
    });
  }

  onSubmitCandidate() {
    if (this.candidateForm.valid) {
      this.isLoading = true;
      const formData = new FormData();
      
      // Append form data
      Object.keys(this.candidateForm.value).forEach(key => {
        if (key !== 'resume') {
          formData.append(key, JSON.stringify(this.candidateForm.value[key]));
        }
      });

      // Append resume file if exists
      const resumeFile = this.candidateForm.get('resume')?.value;
      if (resumeFile) {
        formData.append('resume', resumeFile);
      }

      if (this.selectedCandidate) {
        // Update existing candidate
        this.recruitmentService.updateCandidate(this.selectedCandidate._id, formData).subscribe({
          next: (response) => {
            this.successMessage = 'Candidate updated successfully';
            this.loadCandidates();
            this.resetCandidateForm();
          },
          error: (error) => {
            console.error('Error updating candidate:', error);
            this.errorMessage = 'Error updating candidate: ' + (error.error?.message || error.message);
          },
          complete: () => {
            this.isLoading = false;
          }
        });
      } else {
        // Create new candidate
        this.recruitmentService.createCandidate(formData).subscribe({
          next: (response) => {
            this.successMessage = 'Candidate created successfully';
            this.loadCandidates();
            this.resetCandidateForm();
          },
          error: (error) => {
            console.error('Error creating candidate:', error);
            this.errorMessage = 'Error creating candidate: ' + (error.error?.message || error.message);
          },
          complete: () => {
            this.isLoading = false;
          }
        });
      }
    }
  }

  editCandidate(candidate: any) {
    this.selectedCandidate = candidate;
    this.candidateFormVisible = true;
    this.candidateForm.patchValue({
      name: candidate.name,
      email: candidate.email,
      jobId: candidate.jobsApplied[0]?.job?._id,
      address: candidate.address || {},
      education: candidate.education || [],
      skills: candidate.skills || []
    });
  }

  // Interview Methods
  loadInterviews() {
    this.isLoading = true;
    this.recruitmentService.getAllInterviews().subscribe({
      next: (response) => {
        this.interviews = response.interviews;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Error loading interviews';
        this.isLoading = false;
      }
    });
  }

  onSubmitInterview() {
    if (this.interviewForm.valid) {
      this.isLoading = true;
      const interviewData = {
        ...this.interviewForm.value,
        interviewDate: new Date(this.interviewForm.value.interviewDate).toISOString()
      };

      if (this.selectedInterview) {
        // Update existing interview
        this.recruitmentService.updateInterview(this.selectedInterview._id, interviewData).subscribe({
          next: (response) => {
            this.successMessage = 'Interview updated successfully';
            this.loadInterviews();
            this.resetInterviewForm();
          },
          error: (error) => {
            this.errorMessage = 'Error updating interview: ' + (error.error?.message || error.message);
          },
          complete: () => {
            this.isLoading = false;
          }
        });
      } else {
        // Schedule new interview
        this.recruitmentService.scheduleInterview(interviewData).subscribe({
          next: (response) => {
            this.successMessage = 'Interview scheduled successfully';
            this.loadInterviews();
            this.resetInterviewForm();
          },
          error: (error) => {
            this.errorMessage = 'Error scheduling interview: ' + (error.error?.message || error.message);
          },
          complete: () => {
            this.isLoading = false;
          }
        });
      }
    } else {
      Object.keys(this.interviewForm.controls).forEach(key => {
        const control = this.interviewForm.get(key);
        if (control?.errors) {
          this.errorMessage = 'Please fill in all required fields correctly';
        }
      });
    }
  }

  scheduleInterview(candidate: any) {
    this.setActiveTab('interviews');
    this.interviewFormVisible = true;
    this.interviewForm.patchValue({
      candidate: {
        id: candidate._id,
        name: candidate.name,
        email: candidate.email
      }
    });
  }

  updateInterviewStatus(interview: any) {
    this.selectedInterviewForStatus = interview;
    this.showStatusModal = true;
  }

  confirmStatusUpdate(newStatus: string) {
    if (this.selectedInterviewForStatus) {
      this.isLoading = true;
      this.recruitmentService.updateInterviewStatus(this.selectedInterviewForStatus._id, { status: newStatus }).subscribe({
        next: (response) => {
          this.successMessage = 'Interview status updated successfully';
          this.loadInterviews();
          this.closeStatusModal();
        },
        error: (error) => {
          this.errorMessage = 'Error updating interview status';
        },
        complete: () => {
          this.isLoading = false;
        }
      });
    }
  }

  closeStatusModal() {
    this.showStatusModal = false;
    this.selectedInterviewForStatus = null;
  }

  // Offer Letter Methods
  loadOfferLetters() {
    this.isLoading = true;
    this.recruitmentService.getAllOfferLetters().subscribe({
      next: (response) => {
        this.offerLetters = response.offerLetters;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Error loading offer letters';
        this.isLoading = false;
      }
    });
  }

  onSubmitOfferLetter() {
    if (this.offerLetterForm.valid) {
      this.isLoading = true;
      const offerLetterData = {
        ...this.offerLetterForm.value,
        offerDate: new Date().toISOString()
      };

      // Ensure salary is a number
      if (offerLetterData.offerDetails) {
        offerLetterData.offerDetails.salary = Number(offerLetterData.offerDetails.salary);
      }

      this.recruitmentService.createOfferLetter(offerLetterData).subscribe({
        next: (response) => {
          this.successMessage = 'Offer letter created successfully';
          this.loadOfferLetters();
          this.resetOfferLetterForm();
        },
        error: (error) => {
          this.errorMessage = 'Error creating offer letter: ' + (error.error?.message || error.message);
        },
        complete: () => {
          this.isLoading = false;
        }
      });
    } else {
      // Mark all fields as touched to show validation errors
      this.markFormGroupTouched(this.offerLetterForm);
      
      // Check specific validation errors
      const offerDetails = this.offerLetterForm.get('offerDetails');
      if (offerDetails) {
        const salary = offerDetails.get('salary');
        const location = offerDetails.get('location');
        
        if (salary?.errors) {
          this.errorMessage = 'Please enter a valid salary amount';
        } else if (location?.errors) {
          this.errorMessage = 'Please enter the location';
        } else {
          this.errorMessage = 'Please fill in all required fields correctly';
        }
      }
    }
  }

  // Helper method to mark all controls in a form group as touched
  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  // Utility Methods
  resetJobForm() {
    this.jobForm.reset();
    this.selectedJob = null;
    this.jobFormVisible = false;
  }

  resetCandidateForm() {
    this.candidateForm.reset();
    this.selectedCandidate = null;
    this.candidateFormVisible = false;
  }

  resetInterviewForm() {
    this.interviewForm.reset();
    this.selectedInterview = null;
    this.interviewFormVisible = false;
  }

  resetOfferLetterForm() {
    this.offerLetterForm.reset({
      offerDate: new Date().toISOString().split('T')[0],
      offerDetails: {
        benefits: [],
        salary: null,
        location: '',
        position: ''
      }
    });
    this.offerLetterForm.markAsUntouched();
    this.offerLetterFormVisible = false;
  }

  // Form visibility toggle methods
  toggleJobForm() {
    this.jobFormVisible = !this.jobFormVisible;
    if (!this.jobFormVisible) {
      this.resetJobForm();
    }
  }

  toggleCandidateForm() {
    this.candidateFormVisible = !this.candidateFormVisible;
    if (!this.candidateFormVisible) {
      this.resetCandidateForm();
    }
  }

  toggleInterviewForm() {
    this.interviewFormVisible = !this.interviewFormVisible;
    if (!this.interviewFormVisible) {
      this.resetInterviewForm();
    }
  }

  toggleOfferLetterForm() {
    this.offerLetterFormVisible = !this.offerLetterFormVisible;
    if (!this.offerLetterFormVisible) {
      this.resetOfferLetterForm();
    }
  }

  onFileSelected(event: any, formControlName: string) {
    const file = event.target.files[0];
    if (formControlName === 'resume') {
      this.candidateForm.patchValue({
        resume: file
      });
    }
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
    this.clearMessages();
    this.resetForms();
    
    // Hide all forms when switching tabs
    this.jobFormVisible = false;
    this.candidateFormVisible = false;
    this.interviewFormVisible = false;
    this.offerLetterFormVisible = false;
    
    // Load necessary data for different tabs
    if (tab === 'offerLetters') {
      this.loadCandidates();
      this.loadJobs();
    } else if (tab === 'interviews') {
      this.loadCandidates();
    }
  }

  formatDate(date: string): string {
    if (!date) return '';
    return new Date(date).toISOString().split('T')[0];
  }

  clearMessages() {
    setTimeout(() => {
      this.successMessage = '';
      this.errorMessage = '';
    }, 3000);
  }

  resetForms() {
    switch(this.activeTab) {
      case 'jobs':
        this.resetJobForm();
        break;
      case 'candidates':
        this.resetCandidateForm();
        break;
      case 'interviews':
        this.resetInterviewForm();
        break;
      case 'offerLetters':
        this.resetOfferLetterForm();
        break;
    }
  }

  handleError(error: any, message: string) {
    console.error(error);
    this.errorMessage = error.error?.message || message;
    this.isLoading = false;
    this.clearMessages();
  }

  handleSuccess(message: string) {
    this.successMessage = message;
    this.isLoading = false;
    this.clearMessages();
  }

  getFormControlError(form: FormGroup, controlName: string): string {
    const control = form.get(controlName);
    if (control?.errors && control.touched) {
      if (control.errors['required']) return `${controlName} is required`;
      if (control.errors['email']) return 'Invalid email format';
      if (control.errors['min']) return `${controlName} must be at least ${control.errors['min'].min}`;
    }
    return '';
  }

  isFormControlInvalid(formGroup: AbstractControl | null, controlName: string): boolean {
    if (!formGroup || !(formGroup instanceof FormGroup)) return false;
    const control = formGroup.get(controlName);
    return control ? (control.invalid && (control.dirty || control.touched)) : false;
  }

  // Delete Methods
  deleteJob(id: string) {
    if (confirm('Are you sure you want to delete this job?')) {
      this.recruitmentService.deleteJob(id).subscribe({
        next: () => {
          this.successMessage = 'Job deleted successfully';
          this.loadJobs();
        },
        error: (error) => {
          this.errorMessage = 'Error deleting job';
        }
      });
    }
  }

  deleteCandidate(id: string) {
    if (confirm('Are you sure you want to delete this candidate?')) {
      this.recruitmentService.deleteCandidate(id).subscribe({
        next: () => {
          this.successMessage = 'Candidate deleted successfully';
          this.loadCandidates();
        },
        error: (error) => {
          this.errorMessage = 'Error deleting candidate';
        }
      });
    }
  }

  deleteInterview(id: string) {
    if (confirm('Are you sure you want to delete this interview?')) {
      this.recruitmentService.deleteInterview(id).subscribe({
        next: () => {
          this.successMessage = 'Interview deleted successfully';
          this.loadInterviews();
        },
        error: (error) => {
          this.errorMessage = 'Error deleting interview';
        }
      });
    }
  }

  deleteOfferLetter(id: string) {
    if (confirm('Are you sure you want to delete this offer letter?')) {
      this.recruitmentService.deleteOfferLetter(id).subscribe({
        next: () => {
          this.successMessage = 'Offer letter deleted successfully';
          this.loadOfferLetters();
        },
        error: (error) => {
          this.errorMessage = 'Error deleting offer letter';
        }
      });
    }
  }

  onCandidateSelect(event: any) {
    const selectedCandidateId = event.target.value;
    const selectedCandidate = this.candidates.find(c => c._id === selectedCandidateId);
    
    if (selectedCandidate) {
      this.interviewForm.patchValue({
        candidate: {
          id: selectedCandidate._id,
          name: selectedCandidate.name,
          email: selectedCandidate.email
        }
      });
    }
  }

  onOfferLetterCandidateSelect(event: any) {
    const selectedCandidateId = event.target.value;
    const selectedCandidate = this.candidates.find(c => c._id === selectedCandidateId);
    
    if (selectedCandidate) {
      // Get the job role from the candidate's most recent job application
      const appliedJob = selectedCandidate.jobsApplied?.[0]?.job;
      
      this.offerLetterForm.patchValue({
        candidate: {
          id: selectedCandidate._id,
          name: selectedCandidate.name,
          email: selectedCandidate.email
        },
        offerDetails: {
          position: appliedJob?.role || '' // Auto-fill the position if available
        }
      });
    }
  }

  // Helper method to get form validation errors
  getFormValidationErrors() {
    const errors: any = {};
    Object.keys(this.offerLetterForm.controls).forEach(key => {
      const control = this.offerLetterForm.get(key);
      if (control?.errors) {
        errors[key] = control.errors;
      }
      if (control instanceof FormGroup) {
        Object.keys(control.controls).forEach(subKey => {
          const subControl = control.get(subKey);
          if (subControl?.errors) {
            errors[`${key}.${subKey}`] = subControl.errors;
          }
        });
      }
    });
    return errors;
  }

  // Helper method to get nested form control
  getNestedFormControl(path: string) {
    const parts = path.split('.');
    let control = this.offerLetterForm;
    for (const part of parts) {
      control = control.get(part) as FormGroup;
    }
    return control;
  }
}