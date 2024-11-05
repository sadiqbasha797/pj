import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ManagerComponent } from './manager.component';
import { LoginManagerComponent } from './login-manager/login-manager.component';
import { DashboardManagerComponent } from './dashboard-manager/dashboard-manager.component';
import { ManagerAuthGuard } from '../guards/manager-auth.guard';

const routes: Routes = [
  { path: 'login', component: LoginManagerComponent },
  {
    path: '',
    component: ManagerComponent,
    canActivate: [ManagerAuthGuard],
    children: [
      { path: 'dashboard', component: DashboardManagerComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ManagerRoutingModule { } 