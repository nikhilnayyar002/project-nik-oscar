import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule} from '@angular/forms';

import { UploadRoutingModule } from './upload-routing.module';
import { UploadDataComponent } from './upload-data/upload-data.component';
import { UploadCardComponent } from './upload-card/upload-card.component';
import { PublicUploadComponent } from './public-upload/public-upload.component';

@NgModule({
  declarations: [UploadDataComponent, UploadCardComponent, PublicUploadComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    UploadRoutingModule
  ],
  exports:[UploadCardComponent,UploadDataComponent]
})
export class UploadModule { }
