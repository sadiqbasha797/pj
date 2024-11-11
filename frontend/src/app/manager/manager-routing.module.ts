import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ManagerComponent } from './manager.component';
import { LoginManagerComponent } from './login-manager/login-manager.component';
import { DashboardManagerComponent } from './dashboard-manager/dashboard-manager.component';
import { ProjectsManagerComponent } from './projects-manager/projects-manager.component';
import { TasksManagerComponent } from './tasks-manager/tasks-manager.component';
import { CalendarManagerComponent } from './calendar-manager/calendar-manager.component';
import { ManagerAuthGuard } from '../guards/manager-auth.guard';

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
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ManagerRoutingModule { } 