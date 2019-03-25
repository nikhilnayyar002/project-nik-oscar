import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PublicUploadComponent } from './public-upload/public-upload.component';
import { UploadDataComponent } from './upload-data/upload-data.component';
import { AuthGuard }          from '../auth/auth.guard';

const routes: Routes = [
  {
    path: 'upload',
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        canActivateChild: [AuthGuard],
        children: [
          { path: '', redirectTo: '/upload/upload-data', pathMatch: 'full' },
          { path: 'upload-data', component: UploadDataComponent },
          { path: 'public-upload', component: PublicUploadComponent }
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

export class UploadRoutingModule { }
