import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserComponent } from './user/user.component';
import { UsersComponent } from './users/users.component';
import { AuthGuard } from 'src/app/auth/auth.guard';
import { GroupsComponent } from './groups/groups.component';
import { GroupComponent } from './group/group.component';
import { PostsComponent } from './posts/posts.component';
import { UploadsComponent } from './uploads/uploads.component';
import { UsersListComponent } from './users-list/users-list.component';
import { DiscussionsComponent } from './discussions/discussions.component';

const routes: Routes = [
  {
    path: 'info',
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        canActivateChild: [AuthGuard],
        children: [

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
                component: UserComponent,
                children: [
                  {
                    path: 'posts',
                    component: PostsComponent
                  },
                  {
                    path: 'uploads',
                    component: UploadsComponent
                  } 
                ]

              } 
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
export class InfoRoutingModule { }

