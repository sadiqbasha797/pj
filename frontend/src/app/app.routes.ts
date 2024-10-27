import { Routes } from '@angular/router';
import { ManagerComponent } from './manager/manager.component';
import { DeveloperComponent } from './developer/developer.component';

export const routes: Routes = [
  { 
    path: 'admin', 
    loadChildren: () => import('./admin/admin-routing.module').then(m => m.AdminRoutingModule)
  },
  { path: 'manager', component: ManagerComponent },
  { path: 'developer', component: DeveloperComponent },
  { path: '', redirectTo: '/admin', pathMatch: 'full' },
];
