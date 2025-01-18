import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminComponent } from './admin.component';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ProjectsComponent } from './projects/projects.component';
import { TaskComponent } from './task/task.component';
import { CalendarComponent } from './calendar/calendar.component';
import { AuthGuard } from '../guards/auth.guard';
import { UsersComponent } from './users/users.component';
import { ChatComponent } from './chat/chat.component';
import { ProfileComponent } from './profile/profile.component';
import { LeaveComponent } from './leave/leave.component';
import { NotificationsComponent } from './notifications/notifications.component';
import { ClientsComponent } from './clients/clients.component';
import { MarketingComponent } from './marketing/marketing.component';
import { ViewUpdatesComponent } from './view-updates/view-updates.component';
import { MarketRevenueComponent } from './market-revenue/market-revenue.component';
const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: AdminComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'projects', component: ProjectsComponent },
      { path: 'tasks', component: TaskComponent },
      { path: 'calendar', component: CalendarComponent },
      { path: 'users', component: UsersComponent },
      { path: 'chat', component: ChatComponent },
      { path: 'profile', component: ProfileComponent },
      { path: 'leave', component: LeaveComponent },
      { path: 'notifications', component: NotificationsComponent },
      { path: 'clients', component: ClientsComponent },
      { path: 'marketing', component: MarketingComponent },
      { path: 'view-updates', component: ViewUpdatesComponent },
      { path: 'market-revenue', component: MarketRevenueComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
