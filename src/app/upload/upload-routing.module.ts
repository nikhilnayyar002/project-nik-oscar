import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../auth/auth.guard';
import { UploadDataComponent } from './upload-data/upload-data.component';
import { UploadViewComponent } from './upload-view/upload-view.component';


const routes: Routes = [
  {
    path: 'upload',
    children: [
      {
        path: '',
        children: [
          { path: '', redirectTo: '/upload/upload-view', pathMatch: 'full' },
          { path: 'upload-data',
            component: UploadDataComponent,
            canActivate: [AuthGuard]
          },
          { path: 'upload-view', component: UploadViewComponent}
        ]
      }
    ]
  }
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UploadRoutingModule { }
