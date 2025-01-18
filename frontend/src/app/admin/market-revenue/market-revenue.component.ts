import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../services/admin.service';
import { FormsModule } from '@angular/forms';

interface Revenue {
  _id: string;
  projectId: {
    _id: string;
    title: string;
    description: string;
    deadline: string;
    status: string;
  };
  revenueGenerated: number;
  description: string;
  attachments: string[];
  date: string;
  createdBy: {
    id: string;
    name: string;
    role: string;
  };
}

interface ProjectRevenue {
  projectId: string;
  projectTitle: string;
  projectStatus: string;
  totalRevenue: number;
  revenues: Revenue[];
  filteredRevenues: Revenue[];
  isExpanded?: boolean;
  filters: {
    minAmount: number | null;
    maxAmount: number | null;
    startDate: string | null;
    endDate: string | null;
    createdBy: string | null;
  };
}

@Component({
  selector: 'app-market-revenue',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './market-revenue.component.html',
  styleUrl: './market-revenue.component.css'
})
export class MarketRevenueComponent implements OnInit {
  revenues: Revenue[] = [];
  projectWiseRevenues: ProjectRevenue[] = [];
  loading = true;
  error = '';

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadRevenues();
  }

  loadRevenues(): void {
    this.adminService.getAllRevenue().subscribe({
      next: (response) => {
        this.revenues = response.data;
        this.groupRevenuesByProject();
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load revenues';
        this.loading = false;
        console.error('Error loading revenues:', error);
      }
    });
  }

  toggleProject(project: ProjectRevenue): void {
    project.isExpanded = !project.isExpanded;
  }

  private groupRevenuesByProject(): void {
    const groupedRevenues = new Map<string, ProjectRevenue>();
    
    this.revenues.forEach(revenue => {
      if (!groupedRevenues.has(revenue.projectId._id)) {
        groupedRevenues.set(revenue.projectId._id, {
          projectId: revenue.projectId._id,
          projectTitle: revenue.projectId.title,
          projectStatus: revenue.projectId.status,
          totalRevenue: 0,
          revenues: [],
          filteredRevenues: [],
          isExpanded: false,
          filters: {
            minAmount: null,
            maxAmount: null,
            startDate: null,
            endDate: null,
            createdBy: null
          }
        });
      }
      
      const projectRevenue = groupedRevenues.get(revenue.projectId._id)!;
      projectRevenue.revenues.push(revenue);
      projectRevenue.filteredRevenues.push(revenue);
      projectRevenue.totalRevenue += revenue.revenueGenerated;
    });

    this.projectWiseRevenues = Array.from(groupedRevenues.values());
  }

  applyFilters(project: ProjectRevenue): void {
    project.filteredRevenues = project.revenues.filter(revenue => {
      const amountMatch = (!project.filters.minAmount || revenue.revenueGenerated >= project.filters.minAmount) &&
                         (!project.filters.maxAmount || revenue.revenueGenerated <= project.filters.maxAmount);

      const dateMatch = (!project.filters.startDate || new Date(revenue.date) >= new Date(project.filters.startDate)) &&
                       (!project.filters.endDate || new Date(revenue.date) <= new Date(project.filters.endDate));

      const createdByMatch = !project.filters.createdBy ||
                            revenue.createdBy.name.toLowerCase().includes(project.filters.createdBy.toLowerCase());

      return amountMatch && dateMatch && createdByMatch;
    });

    // Recalculate total revenue for filtered results
    project.totalRevenue = project.filteredRevenues.reduce((sum, revenue) => sum + revenue.revenueGenerated, 0);
  }

  clearFilters(project: ProjectRevenue): void {
    project.filters = {
      minAmount: null,
      maxAmount: null,
      startDate: null,
      endDate: null,
      createdBy: null
    };
    project.filteredRevenues = [...project.revenues];
    project.totalRevenue = project.revenues.reduce((sum, revenue) => sum + revenue.revenueGenerated, 0);
  }
}
