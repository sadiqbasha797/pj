import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { HRService } from '../../services/hr.service';

@Component({
  selector: 'app-users-hr',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    ReactiveFormsModule,
    MatSnackBarModule
  ],
  templateUrl: './users-hr.component.html',
  styleUrls: ['./users-hr.component.css']
})
export class UsersHrComponent implements OnInit {
  developers: any[] = [];
  digitalMarketingUsers: any[] = [];
  contentCreators: any[] = [];
  activeTab: 'developers' | 'digitalMarketing' | 'contentCreators' = 'developers';
  
  showDeveloperForm = false;
  showDigitalMarketingForm = false;
  showContentCreatorForm = false;

  developerForm: FormGroup;
  digitalMarketingForm: FormGroup;
  contentCreatorForm: FormGroup;

  constructor(
    private hrService: HRService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    // Initialize forms in constructor
    this.developerForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      skills: ['']
    });

    this.digitalMarketingForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      skills: ['']
    });

    this.contentCreatorForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      skills: ['']
    });
  }

  ngOnInit() {
    this.loadAllUsers();
  }

  loadAllUsers() {
    this.loadDevelopers();
    this.loadDigitalMarketingUsers();
    this.loadContentCreators();
  }

  loadDevelopers() {
    this.hrService.getDevelopers().subscribe({
      next: (response) => {
        this.developers = response;
      },
      error: (error) => {
        this.showMessage('Error loading developers');
      }
    });
  }

  loadDigitalMarketingUsers() {
    this.hrService.getDigitalMarketers().subscribe({
      next: (response) => {
        this.digitalMarketingUsers = response.data;
      },
      error: (error) => {
        this.showMessage('Error loading digital marketing users');
      }
    });
  }

  loadContentCreators() {
    this.hrService.getContentCreators().subscribe({
      next: (response) => {
        this.contentCreators = response.data;
      },
      error: (error) => {
        this.showMessage('Error loading content creators');
      }
    });
  }

  addDeveloper() {
    if (this.developerForm.valid) {
      const formData = this.developerForm.value;
      formData.skills = formData.skills.split(',').map((skill: string) => skill.trim());
      
      this.hrService.registerDeveloper(formData).subscribe({
        next: () => {
          this.showMessage('Developer added successfully');
          this.loadDevelopers();
          this.showDeveloperForm = false;
          this.developerForm.reset();
        },
        error: (error) => {
          this.showMessage('Error adding developer');
        }
      });
    }
  }

  addDigitalMarketingUser() {
    if (this.digitalMarketingForm.valid) {
      const formData = this.digitalMarketingForm.value;
      formData.skills = formData.skills.split(',').map((skill: string) => skill.trim());
      
      this.hrService.registerDigitalMarketer(formData).subscribe({
        next: () => {
          this.showMessage('Digital Marketing user added successfully');
          this.loadDigitalMarketingUsers();
          this.showDigitalMarketingForm = false;
          this.digitalMarketingForm.reset();
        },
        error: (error) => {
          this.showMessage('Error adding Digital Marketing user');
        }
      });
    }
  }

  addContentCreator() {
    if (this.contentCreatorForm.valid) {
      const formData = this.contentCreatorForm.value;
      formData.skills = formData.skills.split(',').map((skill: string) => skill.trim());
      
      this.hrService.registerContentCreator(formData).subscribe({
        next: () => {
          this.showMessage('Content Creator added successfully');
          this.loadContentCreators();
          this.showContentCreatorForm = false;
          this.contentCreatorForm.reset();
        },
        error: (error) => {
          this.showMessage('Error adding Content Creator');
        }
      });
    }
  }

  deleteDeveloper(id: string) {
    if (confirm('Are you sure you want to delete this developer?')) {
      this.hrService.deleteDeveloper(id).subscribe({
        next: () => {
          this.showMessage('Developer deleted successfully');
          this.loadDevelopers();
        },
        error: (error) => {
          this.showMessage('Error deleting developer');
        }
      });
    }
  }

  deleteDigitalMarketingUser(id: string) {
    if (confirm('Are you sure you want to delete this digital marketing user?')) {
      this.hrService.deleteDigitalMarketer(id).subscribe({
        next: () => {
          this.showMessage('Digital marketing user deleted successfully');
          this.loadDigitalMarketingUsers();
        },
        error: (error) => {
          this.showMessage('Error deleting digital marketing user');
        }
      });
    }
  }

  deleteContentCreator(id: string) {
    if (confirm('Are you sure you want to delete this content creator?')) {
      this.hrService.deleteContentCreator(id).subscribe({
        next: () => {
          this.showMessage('Content creator deleted successfully');
          this.loadContentCreators();
        },
        error: (error) => {
          this.showMessage('Error deleting content creator');
        }
      });
    }
  }

  private showMessage(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }

  parseSkills(skills: string[]): string[] {
    if (!skills || !skills.length) return [];
    try {
      // If the skill is already a string array, return it
      if (typeof skills[0] !== 'string' || !skills[0].startsWith('[')) {
        return skills;
      }
      // If the skill is a stringified JSON array, parse it
      return JSON.parse(skills[0]);
    } catch {
      return skills;
    }
  }
}
