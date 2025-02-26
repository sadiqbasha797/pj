import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MarketerComponent } from './marketer.component';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { TaskComponent } from './task/task.component';
import { MarketerAuthGuard } from '../guards/marketer-auth.guard';
import { TaskUpdatesComponent } from './task-updates/task-updates.component';
import { RevenueComponent } from './revenue/revenue.component';
import { ProfileComponent } from './profile/profile.component';
import { NotificationsComponent } from './notifications/notifications.component';
import { MeetingsMarketerComponent } from './meetings-marketer/meetings-marketer.component';
import { CalendarMarketerComponent } from './calendar-marketer/calendar-marketer.component';
import { DashboardMarketerComponent } from './dashboard-marketer/dashboard-marketer.component';
import { LeaveMarketerComponent } from './leave-marketer/leave-marketer.component';
import { ChatMarketerComponent } from './chat-marketer/chat-marketer.component';
const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: MarketerComponent,
    canActivate: [MarketerAuthGuard],
    children: [
      { path: 'dashboard', component: DashboardMarketerComponent },
      { path: 'tasks', component: TaskComponent },
      { path: 'task-updates', component: TaskUpdatesComponent },
      { path: 'revenue', component: RevenueComponent },
      { path: 'profile', component: ProfileComponent },
      { path: 'notifications', component: NotificationsComponent },
      { path: 'meetings', component: MeetingsMarketerComponent },
      { path: 'leave', component: LeaveMarketerComponent },
      { path: 'chat', component: ChatMarketerComponent },
      { path: 'calendar', component: CalendarMarketerComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  }
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MarketerRoutingModule { }
