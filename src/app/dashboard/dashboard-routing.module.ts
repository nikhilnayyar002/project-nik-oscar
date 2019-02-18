import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { GeneralComponent } from './general/general.component';
import { PrivacyComponent } from './privacy/privacy.component';
import { OthersComponent } from './others/others.component';
import { ContainerComponent } from './container/container.component';
import { AuthGuard }          from '../auth/auth.guard';

const routes: Routes = [
  {
    path: 'dashboard',
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        canActivateChild: [AuthGuard],
        children: [
          { path: '', redirectTo: '/dashboard/general', pathMatch: 'full' },
          { path: 'general', component: GeneralComponent },
          { path: 'others', component: OthersComponent },
          { path: 'privacy', component: PrivacyComponent },
          { path: 'container', component: ContainerComponent }
        ]
      }
    ]
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [
    RouterModule
  ]
})
export class DashboardRoutingModule {}

