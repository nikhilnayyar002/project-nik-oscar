import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DesignComponent } from './design/design.component';
import { AuthGuard }   from '../auth/auth.guard';
import { MainComponent } from './main/main.component';
import { ViewComponent } from './view/view.component';

const routes: Routes = [
  {
    path: 'template',
    children: [
      {
        path: '',
        canActivate: [AuthGuard],
        children: [
          { path: '', component: MainComponent },
          { path: 'design/:id', component: DesignComponent }
        ]
      },
      { path: 'view/:id', component: ViewComponent } 
    ]
  }
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TemplateRoutingModule { }
