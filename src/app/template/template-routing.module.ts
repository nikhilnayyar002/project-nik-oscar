import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { IntroComponent } from './intro/intro.component';
import { AuthGuard } from '../auth/auth.guard';
import { DesignComponent } from './design/design.component';

const routes: Routes = [
  {
    path: 'template',
    children: [
      {
        path: '', //IntroComponent
        component: IntroComponent,
        canActivateChild: [AuthGuard],
        children: [
          {
            path: '',
            canActivateChild:[AuthGuard],
            children:[
              { path: 'design/:id', component: DesignComponent }
            ]
          }
        ]
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TemplateRoutingModule { }
