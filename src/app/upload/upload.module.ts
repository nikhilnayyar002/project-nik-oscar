import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UploadRoutingModule } from './upload-routing.module';
import { UploadPaginComponent } from './upload-pagin/upload-pagin.component';
import { UploadDataComponent } from './upload-data/upload-data.component';
import { UploadViewComponent } from './upload-view/upload-view.component';
import { UploadCardComponent } from './upload-card/upload-card.component';

@NgModule({
  declarations: [UploadPaginComponent, UploadDataComponent, UploadViewComponent, UploadCardComponent],
  imports: [
    CommonModule,
    UploadRoutingModule
  ]
})
export class UploadModule { }
