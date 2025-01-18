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
const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: MarketerComponent,
    canActivate: [MarketerAuthGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'tasks', component: TaskComponent },
      { path: 'task-updates', component: TaskUpdatesComponent },
      { path: 'revenue', component: RevenueComponent },
      { path: 'profile', component: ProfileComponent },
      { path: 'notifications', component: NotificationsComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MarketerRoutingModule { }
