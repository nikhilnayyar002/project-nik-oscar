import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginPaletComponent }  from './login-palet/login-palet.component';
import { PostPaletComponent }   from './post-palet/post-palet.component';
import { HomeComponent } from './home/home.component';
import { NotifPaletComponent } from './notif-palet/notif-palet.component';
import { PageNotFoundComponent }    from './page-not-found/page-not-found.component';
import { AuthGuard } from './auth/auth.guard';
import { DashPaletComponent } from './dash-palet/dash-palet.component';
const routes: Routes = [
  {
    path: 'login-palet',
    component: LoginPaletComponent,
    outlet: 'palet'
  },
  {
    path: 'post-palet',
    component: PostPaletComponent,
    outlet: 'palet',
    canActivate: [AuthGuard]
  },
  {
    path: 'notif-palet',
    component: NotifPaletComponent,
    outlet: 'palet',
    canActivate: [AuthGuard]
  },
  {
    path: 'dash-palet',
    component: DashPaletComponent,
    outlet: 'palet',
  },  
  {
    path: 'home',
    component: HomeComponent,
  },
  { path: '',   redirectTo: '/home', pathMatch: 'full' },
  { path: '**', component: PageNotFoundComponent }
 
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {

    })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}