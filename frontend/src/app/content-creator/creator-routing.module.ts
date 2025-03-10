import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginCreatorComponent } from './login-creator/login-creator.component';
import { ProfileCreatorComponent } from './profile-creator/profile-creator.component';
import { NavbarCreatorComponent } from './navbar-creator/navbar-creator.component';
import { SidebarCreatorComponent } from './sidebar-creator/sidebar-creator.component';
import { ContentCreatorComponent } from './content-creator.component';
import { CreatorAuthGuard } from '../guards/creator-auth.guard';
import { TaskCreatorComponent } from './task-creator/task-creator.component';
import { UpdatesCreatorComponent } from './updates-creator/updates-creator.component';
import { NotificationsCreatorComponent } from './notifications-creator/notifications-creator.component';
import { MeetingsCreatorComponent } from './meetings-creator/meetings-creator.component';
import { CalendarCreatorComponent } from './calendar-creator/calendar-creator.component';
import { LeaveCreatorComponent } from './leave-creator/leave-creator.component';
import { CreatorDashboardComponent } from './creator-dashboard/creator-dashboard.component';
const routes: Routes = [
  { path: 'login', component: LoginCreatorComponent },
  { 
    path: '', 
    component: ContentCreatorComponent,
    canActivate: [CreatorAuthGuard],
    children: [
      { path: 'profile', component: ProfileCreatorComponent },
      { path: 'navbar', component: NavbarCreatorComponent },
      { path: 'sidebar', component: SidebarCreatorComponent },
      { path: 'updates', component: UpdatesCreatorComponent },
      { path: 'tasks', component: TaskCreatorComponent },
      { path: 'notifications', component: NotificationsCreatorComponent },
      { path: 'meetings', component: MeetingsCreatorComponent },
      { path: 'calendar', component: CalendarCreatorComponent },
      { path: 'leave', component: LeaveCreatorComponent },
      { path: 'dashboard', component: CreatorDashboardComponent },
      { path: '', redirectTo: 'profile', pathMatch: 'full' }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CreatorRoutingModule { }
