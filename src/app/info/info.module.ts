import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InfoRoutingModule } from './info-routing.module';
import { UserComponent } from './user/user.component';
import { UsersComponent } from './users/users.component';
import { MyModules } from '../my-modules';
import { GroupsComponent } from './groups/groups.component';
import { GroupComponent } from './group/group.component';
import { PostsComponent } from './posts/posts.component';
import { UploadsComponent } from './uploads/uploads.component';
import { UsersListComponent } from './users-list/users-list.component';
import { DiscussionsComponent } from './discussions/discussions.component';


@NgModule({
  declarations: [
  	UserComponent,
  	UsersComponent,
  	GroupsComponent,
  	GroupComponent,
  	PostsComponent,
  	UploadsComponent,
  	UsersListComponent,
  	DiscussionsComponent
  ],
  imports: [
    CommonModule,
    InfoRoutingModule,
    MyModules
  ]
})
export class InfoModule { }
