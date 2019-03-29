import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IntroComponent } from './intro/intro.component';
import { GroupsComponent } from './groups/groups.component';
import { GroupComponent } from './group/group.component';
import { UsersComponent } from './users/users.component';
import { UserComponent } from './user/user.component';
import { DiscussionsComponent } from './discussions/discussions.component';
import { InfoRoutingModule } from './info-routing.module';
import { ViewsComponent } from './views/views.component';
import { ViewComponent } from './view/view.component';
import { UsersListComponent } from './user-list/user-list.component';
import { PostModule } from '../post/post.module';
import { UploadModule } from '../upload/upload.module';

@NgModule({
  declarations: [
    IntroComponent,
    GroupsComponent,
    GroupComponent,
    UsersComponent,
    UserComponent,
    UsersListComponent,
    DiscussionsComponent,
    ViewsComponent,
    ViewComponent
  ],
  imports: [
    CommonModule,
    InfoRoutingModule,
    PostModule,
    UploadModule
  ]
})
export class InfoModule { }
