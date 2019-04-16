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
import { PostModule } from '../post/post.module';
import { UploadModule } from '../upload/upload.module';
import { UsersListComponent } from './users-list/users-list.component';
import { SharedModule } from '../shared.module';

@NgModule({
  declarations: [
    IntroComponent,
    GroupsComponent,
    GroupComponent,
    UsersComponent,
    UserComponent,
    DiscussionsComponent,
    ViewsComponent,
    ViewComponent,
    UsersListComponent
  ],
  imports: [
    CommonModule,
    InfoRoutingModule,
    PostModule,
    UploadModule,
    SharedModule
  ],
  exports:[ViewComponent]
})
export class InfoModule { }
