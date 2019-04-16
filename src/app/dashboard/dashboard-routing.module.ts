import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../auth/auth.guard';
import { IntoComponent } from './into/into.component';
import { GeneralComponent } from './general/general.component';
import { MoreComponent } from './more/more.component';
import { PrivacyComponent } from './privacy/privacy.component';
import { ContainerComponent } from './container/container.component';


const routes: Routes = [
  {
    path: 'dashboard',
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        canActivateChild: [AuthGuard],
        children: [
          { path: '', component: IntoComponent },
          { path: 'general', component: GeneralComponent },
          { path: 'more', component: MoreComponent },
          { path: 'privacy', component: PrivacyComponent },
          { path: 'container', component: ContainerComponent }
        ]
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }
