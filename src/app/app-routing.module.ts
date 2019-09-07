import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PopupLoginComponent } from './home/popup-login/popup-login.component';
import { PopupPostComponent } from './home/popup-post/popup-post.component';
import { PopupNotifComponent } from './home/popup-notif/popup-notif.component';
import { AuthGuard } from './auth/auth.guard';
import { PageNotFoundComponent } from './home/page-not-found/page-not-found.component';
import { HomepageComponent } from './home/homepage/homepage.component';
import { PopupUploadComponent } from './home/popup-upload/popup-upload.component';

const routes: Routes = [
  {
    path: 'popup-login',
    component: PopupLoginComponent,
    outlet: 'popup'
  },
  {
    path: 'popup-post',
    component: PopupPostComponent,
    outlet: 'popup',
    canActivate: [AuthGuard]
  },
  {
    path: 'popup-upload',
    component: PopupUploadComponent,
    outlet: 'popup',
    canActivate: [AuthGuard]
  },  
  {
    path: 'popup-notif',
    component: PopupNotifComponent,
    outlet: 'popup',
    canActivate: [AuthGuard]
  }, 
  {
    path: 'home',
    component: HomepageComponent,
  },
  { path: '',   redirectTo: '/home', pathMatch: 'full' },
  { path: '**', component: PageNotFoundComponent }
 
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
