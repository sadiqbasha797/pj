import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DeveloperComponent } from './developer.component';
import { LoginDeveloperComponent } from './login-developer/login-developer.component';
import { DashboardDeveloperComponent } from './dashboard-developer/dashboard-developer.component';
import { ProjectsDeveloperComponent } from './projects-developer/projects-developer.component';
import { TaskDeveloperComponent } from './task-developer/task-developer.component';
import { CalendarDeveloperComponent } from './calendar-developer/calendar-developer.component';
import { ChatDeveloperComponent } from './chat-developer/chat-developer.component';
import { LeaveDeveloperComponent } from './leave-developer/leave-developer.component';
import { ProfileDeveloperComponent } from './profile-developer/profile-developer.component';
import { NotificationsDeveloperComponent } from './notifications-developer/notifications-developer.component';
import { DeveloperAuthGuard } from '../guards/developer-auth.guard';

const routes: Routes = [
  { path: 'login', component: LoginDeveloperComponent },
  {
    path: '',
    component: DeveloperComponent,
    canActivate: [DeveloperAuthGuard],
    children: [
      { path: 'dashboard', component: DashboardDeveloperComponent },
      { path: 'projects', component: ProjectsDeveloperComponent },
      { path: 'tasks', component: TaskDeveloperComponent },
      { path: 'calendar', component: CalendarDeveloperComponent },
      { path: 'chat', component: ChatDeveloperComponent },
      { path: 'leave', component: LeaveDeveloperComponent },
      { path: 'profile', component: ProfileDeveloperComponent },
      { path: 'notifications', component: NotificationsDeveloperComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DeveloperRoutingModule { } 