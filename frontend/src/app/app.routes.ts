import { Routes } from '@angular/router';
import { DeveloperComponent } from './developer/developer.component';

export const routes: Routes = [
  { 
    path: 'admin', 
    loadChildren: () => import('./admin/admin-routing.module').then(m => m.AdminRoutingModule)
  },
  { 
    path: 'manager', 
    loadChildren: () => import('./manager/manager-routing.module').then(m => m.ManagerRoutingModule)
  },
  { path: 'developer', component: DeveloperComponent },
  { path: '', redirectTo: '/admin', pathMatch: 'full' },
];
