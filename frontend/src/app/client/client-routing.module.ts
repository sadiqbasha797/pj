import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ClientComponent } from './client.component';
import { ProjectsClientComponent } from './projects-client/projects-client.component';
import { MeetingsComponent } from './meetings/meetings.component';
import { LoginClientComponent } from './login-client/login-client.component';
import { ClientAuthGuard } from '../guards/client-auth.guard';

const routes: Routes = [
  { path: 'login', component: LoginClientComponent },
  {
    path: '',
    component: ClientComponent,
    canActivate: [ClientAuthGuard],
    children: [
      { path: 'projects', component: ProjectsClientComponent },
      { path: 'meetings', component: MeetingsComponent },
      { path: '', redirectTo: 'projects', pathMatch: 'full' }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ClientRoutingModule { } 