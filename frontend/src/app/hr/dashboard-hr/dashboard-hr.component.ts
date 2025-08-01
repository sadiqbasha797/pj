import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { HRService } from '../../services/hr.service';
import { ChartConfiguration, ChartType } from 'chart.js';
import { NgChartsModule } from 'ng2-charts';

@Component({
  selector: 'app-dashboard-hr',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatIconModule,
    MatDividerModule,
    NgChartsModule
    
  ],
  templateUrl: './dashboard-hr.component.html',
  styleUrl: './dashboard-hr.component.css'
})
export class DashboardHrComponent implements OnInit {
  loading = true;
  error = '';

  // Stat cards
  totalDevelopers = 0;
  totalMarketers = 0;
  totalContentCreators = 0;
  totalPayslips = 0;
  totalLeaves = 0;
  pendingLeaves = 0;
  approvedLeaves = 0;
  deniedLeaves = 0;
  pendingTeamRequests = 0;
  processedTeamRequests = 0;

  // Chart data
  employeeRoleChartData: ChartConfiguration<'pie'>['data'] = { labels: [], datasets: [] };
  payslipStatsChartData: ChartConfiguration<'bar'>['data'] = { labels: [], datasets: [] };
  leaveStatusChartData: ChartConfiguration<'doughnut'>['data'] = { labels: [], datasets: [] };

  // Chart options
  payslipStatsChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 14 } }
      },
      y: {
        grid: { display: false },
        beginAtZero: true,
        ticks: { font: { size: 14 }, stepSize: 1 }
      }
    },
    layout: {
      padding: 0
    }
  };

  // Recent activity tables
  recentPayslips: any[] = [];
  recentLeaves: any[] = [];
  recentTeamRequests: any[] = [];

  constructor(private hrService: HRService) {}

  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    this.loading = true;
    this.error = '';
    Promise.all([
      this.hrService.getDevelopers().toPromise(),
      this.hrService.getDigitalMarketers().toPromise(),
      this.hrService.getContentCreators().toPromise(),
      this.hrService.getAllPayslips().toPromise(),
      this.hrService.getAllHolidays().toPromise(),
      this.hrService.getPendingTeamRequests().toPromise()
    ]).then(([devs, marketers, creators, payslipsRes, leaves, teamReqs]) => {
      // Users
      this.totalDevelopers = Array.isArray(devs) ? devs.length : 0;
      this.totalMarketers = Array.isArray(marketers?.data) ? marketers.data.length : 0;
      this.totalContentCreators = Array.isArray(creators?.data) ? creators.data.length : 0;

      // Payslips
      const payslips = payslipsRes?.data || [];
      this.totalPayslips = payslips.length;
      this.recentPayslips = payslips.slice(-4).reverse();

      // Leaves
      this.totalLeaves = Array.isArray(leaves) ? leaves.length : 0;
      this.pendingLeaves = leaves.filter((l: any) => l.status === 'Pending').length;
      this.approvedLeaves = leaves.filter((l: any) => l.status === 'Approved').length;
      this.deniedLeaves = leaves.filter((l: any) => l.status === 'Denied').length;
      this.recentLeaves = leaves.slice(-4).reverse();

      // Team Requests
      const teamRequests = teamReqs?.requests || [];
      this.pendingTeamRequests = teamRequests.filter((r: any) => r.status === 'pending').length;
      this.processedTeamRequests = teamRequests.length - this.pendingTeamRequests;
      this.recentTeamRequests = teamRequests.slice(-4).reverse();

      // Charts
      this.employeeRoleChartData = {
        labels: ['Developers', 'Marketers', 'Content Creators'],
        datasets: [{
          data: [this.totalDevelopers, this.totalMarketers, this.totalContentCreators],
          backgroundColor: ['#1976d2', '#43a047', '#fbc02d']
        }]
      };
      this.payslipStatsChartData = {
        labels: ['Developers', 'Marketers', 'Content Creators'],
        datasets: [{
          label: 'Payslips',
          data: [
            payslips.filter((p: any) => p.paidTo.role === 'developer').length,
            payslips.filter((p: any) => p.paidTo.role === 'digital-marketing').length,
            payslips.filter((p: any) => p.paidTo.role === 'content-creator').length
          ],
          backgroundColor: ['#1976d2', '#43a047', '#fbc02d']
        }]
      };
      this.leaveStatusChartData = {
        labels: ['Pending', 'Approved', 'Denied'],
        datasets: [{
          data: [this.pendingLeaves, this.approvedLeaves, this.deniedLeaves],
          backgroundColor: ['#ffa726', '#66bb6a', '#ef5350']
        }]
      };
      this.loading = false;
    }).catch((err) => {
      this.error = 'Failed to load dashboard data.';
      this.loading = false;
    });
  }
}
