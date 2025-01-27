import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ManagerComponent } from './manager.component';
import { LoginManagerComponent } from './login-manager/login-manager.component';
import { DashboardManagerComponent } from './dashboard-manager/dashboard-manager.component';
import { ProjectsManagerComponent } from './projects-manager/projects-manager.component';
import { TasksManagerComponent } from './tasks-manager/tasks-manager.component';
import { CalendarManagerComponent } from './calendar-manager/calendar-manager.component';
import { UsersManagerComponent } from './users-manager/users-manager.component';
import { ChatManagerComponent } from './chat-manager/chat-manager.component';
import { LeaveManagerComponent } from './leave-manager/leave-manager.component';
import { ProfileManagerComponent } from './profile-manager/profile-manager.component';
import { ManagerAuthGuard } from '../guards/manager-auth.guard';
import { NotificationsManagerComponent } from './notifications-manager/notifications-manager.component';
import { MarketingManagerComponent } from './marketing-manager/marketing-manager.component';
import { UpdatesManagerComponent } from './updates-manager/updates-manager.component';
const routes: Routes = [
  { path: 'login', component: LoginManagerComponent },
  {
    path: '',
    component: ManagerComponent,
    canActivate: [ManagerAuthGuard],
    children: [
      { path: 'dashboard', component: DashboardManagerComponent },
      { path: 'projects', component: ProjectsManagerComponent },
      { path: 'tasks', component: TasksManagerComponent },
      { path: 'calendar', component: CalendarManagerComponent },
      { path: 'users', component: UsersManagerComponent },
      { path: 'chat', component: ChatManagerComponent },
      { path: 'leave', component: LeaveManagerComponent },
      { path: 'profile', component: ProfileManagerComponent },
      { path: 'notifications', component: NotificationsManagerComponent },
      { path: 'marketing', component: MarketingManagerComponent },
      { path: 'updates', component: UpdatesManagerComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ManagerRoutingModule { } 