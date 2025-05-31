import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HrComponent } from './hr.component';
import { LoginHrComponent } from './login-hr/login-hr.component';
import { UsersHrComponent } from './users-hr/users-hr.component';
import { TeamRequestsHrComponent } from './team-requests-hr/team-requests-hr.component';
import { HrAuthGuard } from '../guards/hr-auth.guard';
import { PayslipHrComponent } from './payslip-hr/payslip-hr.component';
import { ProfileHrComponent } from './profile-hr/profile-hr.component';
import { LeaveHrComponent } from './leave-hr/leave-hr.component';
import { NotificationsHrComponent } from './notifications-hr/notifications-hr.component';
import { RecruitmentComponent } from '../recruitment/recruitment.component';
const routes: Routes = [
  { path: 'login', component: LoginHrComponent },
  {
    path: '',
    component: HrComponent,
    canActivate: [HrAuthGuard],
    children: [
      { path: 'users', component: UsersHrComponent },
      { path: 'team-requests', component: TeamRequestsHrComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'payslip', component: PayslipHrComponent },
      { path: 'profile', component: ProfileHrComponent },
      {path: 'leaves', component: LeaveHrComponent},
      {path: 'notifications', component: NotificationsHrComponent},
      {path: 'recruitment', component: RecruitmentComponent}
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HrRoutingModule { }
