import { Routes } from '@angular/router';
import { DeveloperComponent } from './developer/developer.component';
import { WelcomeComponent } from './welcome/welcome.component';

export const routes: Routes = [
  { path: 'welcome', component: WelcomeComponent },
  { 
    path: 'admin', 
    loadChildren: () => import('./admin/admin-routing.module').then(m => m.AdminRoutingModule)
  },
  { 
    path: 'manager', 
    loadChildren: () => import('./manager/manager-routing.module').then(m => m.ManagerRoutingModule)
  },
  { 
    path: 'developer', 
    loadChildren: () => import('./developer/developer-routing.module').then(m => m.DeveloperRoutingModule)
  },
  { 
    path: 'client', 
    loadChildren: () => import('./client/client-routing.module').then(m => m.ClientRoutingModule)
  },
  { 
    path: 'marketer', 
    loadChildren: () => import('./marketer/marketer-routing.module').then(m => m.MarketerRoutingModule)
  },
  { 
    path: 'content-creator', 
    loadChildren: () => import('./content-creator/creator-routing.module').then(m => m.CreatorRoutingModule)
  },
  { path: '', redirectTo: '/welcome', pathMatch: 'full' },
];
