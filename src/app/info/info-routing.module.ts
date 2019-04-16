import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../auth/auth.guard';
import { IntroComponent } from './intro/intro.component';
import { GroupsComponent } from './groups/groups.component';
import { GroupComponent } from './group/group.component';
import { DiscussionsComponent } from './discussions/discussions.component';
import { UsersComponent } from './users/users.component';
import { UserComponent } from './user/user.component';
import { PostViewComponent } from '../post/post-view/post-view.component';
import { UploadViewComponent } from '../upload/upload-view/upload-view.component';
import { ViewsComponent } from './views/views.component';
import { ViewComponent } from './view/view.component';
import { UsersListComponent } from './users-list/users-list.component';

const routes: Routes = [
  {
    path: 'info',
    canActivate:[AuthGuard],
    children: [
      {
        path: '',
        component:IntroComponent
      },
      {
        path: 'groups',
        component: GroupsComponent,
        children: [
          {
            path: ':id',
            component: GroupComponent,
            children: [
              {
                path: 'discussions',
                component: DiscussionsComponent
              },
              {
                path: 'users',
                component: UsersListComponent
              } 
            ]
          } 
        ]
      },
      {
        path: 'users',
        component: UsersComponent,
        children: [
          {
            path: ':id',
            component: UserComponent
          } 
        ]
      },
      {
        path: 'views',
        component:ViewsComponent
      },
      {
        path:'view/:id',
        component:ViewComponent
      }     
    ]  
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InfoRoutingModule { }
