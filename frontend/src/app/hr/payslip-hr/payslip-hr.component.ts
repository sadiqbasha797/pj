import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HRService } from '../../services/hr.service';

interface Payslip {
  _id: string;
  paidTo: {
    id: string;
    name: string;
    role: string;
    model: string;
  };
  amount: number;
  paidDate: string;
  description: string;
}

interface PayslipStats {
  _id: string;
  totalAmount: number;
  count: number;
  avgAmount: number;
}

@Component({
  selector: 'app-payslip-hr',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './payslip-hr.component.html',
  styleUrls: ['./payslip-hr.component.css']
})
export class PayslipHrComponent implements OnInit {
  payslips: Payslip[] = [];
  stats: PayslipStats[] = [];
  developers: any[] = [];
  marketers: any[] = [];
  contentCreators: any[] = [];
  
  newPayslip = {
    employeeId: '',
    amount: 0,
    paidDate: '',
    description: '',
    employeeRole: ''
  };

  isModalOpen = false;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(private hrService: HRService) {}

  ngOnInit() {
    this.loadPayslips();
    this.loadStats();
    this.loadEmployees();
  }

  loadPayslips() {
    this.isLoading = true;
    this.hrService.getAllPayslips().subscribe({
      next: (response) => {
        this.payslips = response.data;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error.message;
        this.isLoading = false;
      }
    });
  }

  loadStats() {
    this.hrService.getPayslipStats().subscribe({
      next: (response) => {
        this.stats = response.data;
      },
      error: (error) => {
        console.error('Error loading stats:', error);
      }
    });
  }

  loadEmployees() {
    this.hrService.getDevelopers().subscribe({
      next: (response) => {
        this.developers = response;
      },
      error: (error) => console.error('Error loading developers:', error)
    });

    this.hrService.getDigitalMarketers().subscribe({
      next: (response) => {
        this.marketers = response.data;
      },
      error: (error) => console.error('Error loading marketers:', error)
    });

    this.hrService.getContentCreators().subscribe({
      next: (response) => {
        this.contentCreators = response.data;
      },
      error: (error) => console.error('Error loading content creators:', error)
    });
  }

  openModal() {
    this.isModalOpen = true;
    this.resetForm();
  }

  closeModal() {
    this.isModalOpen = false;
    this.resetForm();
  }

  resetForm() {
    this.newPayslip = {
      employeeId: '',
      amount: 0,
      paidDate: '',
      description: '',
      employeeRole: ''
    };
    this.errorMessage = '';
    this.successMessage = '';
  }

  createPayslip() {
    this.isLoading = true;
    this.hrService.createPayslip(this.newPayslip).subscribe({
      next: (response) => {
        this.successMessage = 'Payslip created successfully';
        this.loadPayslips();
        this.loadStats();
        setTimeout(() => this.closeModal(), 1500);
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error.error.message || 'Error creating payslip';
        this.isLoading = false;
      }
    });
  }

  deletePayslip(id: string) {
    if (confirm('Are you sure you want to delete this payslip?')) {
      this.hrService.deletePayslip(id).subscribe({
        next: () => {
          this.loadPayslips();
          this.loadStats();
        },
        error: (error) => {
          this.errorMessage = error.error.message || 'Error deleting payslip';
        }
      });
    }
  }

  getRoleEmployees() {
    switch (this.newPayslip.employeeRole) {
      case 'developer':
        return this.developers;
      case 'digital-marketing':
        return this.marketers;
      case 'content-creator':
        return this.contentCreators;
      default:
        return [];
    }
  }

  formatDate(date: string) {
    return new Date(date).toLocaleDateString();
  }

  formatCurrency(amount: number) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }
}
