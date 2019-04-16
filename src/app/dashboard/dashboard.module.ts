import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { GeneralComponent } from './general/general.component';
import { IntoComponent } from './into/into.component';
import { MoreComponent } from './more/more.component';
import { PrivacyComponent } from './privacy/privacy.component';
import { ContainerComponent } from './container/container.component';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../shared.module';
import { PostModule } from '../post/post.module';
import { UploadModule } from '../upload/upload.module';

@NgModule({
  declarations: [
    GeneralComponent,
    IntoComponent,
    MoreComponent,
    PrivacyComponent,
    ContainerComponent
  ],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    FormsModule,
    SharedModule,
    PostModule,
    UploadModule
  ]
})
export class DashboardModule { }
