import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UploadRoutingModule } from './upload-routing.module';
import { UploadDataComponent } from './upload-data/upload-data.component';
import { UploadViewComponent } from './upload-view/upload-view.component';
import { UploadCardComponent } from './upload-card/upload-card.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UploadService } from '../upload.service';

@NgModule({
  declarations: [UploadDataComponent, UploadViewComponent, UploadCardComponent],
  imports: [
    CommonModule,
    UploadRoutingModule,
    ReactiveFormsModule,
    FormsModule
  ],
  exports:[UploadCardComponent,UploadDataComponent,UploadViewComponent],
  providers:[UploadService]
})
export class UploadModule { }
